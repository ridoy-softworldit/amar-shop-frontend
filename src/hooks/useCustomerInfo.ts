/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  houseOrVillage: string;
  roadOrPostOffice: string;
  blockOrThana: string;
  district: string;
}

export const useCustomerInfo = () => {
  const { user, isAuthed, isHydrated } = useAuth();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
    houseOrVillage: "",
    roadOrPostOffice: "",
    blockOrThana: "",
    district: "",
  });
  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthed && user) {
      // Logged-in user: pre-fill from user data
      setCustomerInfo({
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
        houseOrVillage: extractAddressPart(user.address, 0),
        roadOrPostOffice: extractAddressPart(user.address, 1),
        blockOrThana: extractAddressPart(user.address, 2),
        district: extractAddressPart(user.address, 3),
      });
      setIsGuest(false);
    } else {
      // Guest user: try to load from localStorage
      try {
        const savedPhone = localStorage.getItem("customer_phone");
        const savedCustomer = localStorage.getItem("checkout_customer");
        
        if (savedCustomer) {
          const parsed = JSON.parse(savedCustomer);
          setCustomerInfo({
            name: parsed.name || "",
            phone: parsed.phone || savedPhone || "",
            email: parsed.email || "",
            houseOrVillage: parsed.houseOrVillage || "",
            roadOrPostOffice: parsed.roadOrPostOffice || "",
            blockOrThana: parsed.blockOrThana || "",
            district: parsed.district || "",
          });
        } else if (savedPhone) {
          setCustomerInfo((prev) => ({ ...prev, phone: savedPhone }));
        }
      } catch (error) {
        console.error("Failed to load customer info from localStorage:", error);
      }
      setIsGuest(true);
    }
  }, [user, isAuthed, isHydrated]);

  const saveCustomerInfo = (info: CustomerInfo) => {
    setCustomerInfo(info);
    
    // Save to localStorage for guests
    if (isGuest) {
      try {
        localStorage.setItem("customer_phone", info.phone);
        localStorage.setItem("checkout_customer", JSON.stringify(info));
      } catch (error) {
        console.error("Failed to save customer info to localStorage:", error);
      }
    }
  };

  return {
    customerInfo,
    saveCustomerInfo,
    isGuest,
    isLoggedIn: isAuthed,
    user,
  };
};

// Helper to extract address parts from a comma-separated string
function extractAddressPart(address: string | undefined, index: number): string {
  if (!address) return "";
  const parts = address.split(",").map((p) => p.trim());
  return parts[index] || "";
}
