import { z } from "zod";

export const CustomerInfoSchema = z.object({
  name: z.string().min(2, "Full name required"),
 
  phone: z
    .string()
    .regex(/^01[0-9]{9}$/, "Enter a valid Bangladeshi number (01XXXXXXXXX)"),
  houseOrVillage: z.string().min(2, "House / Village required"),
  roadOrPostOffice: z.string().min(2, "Road / Post Office required"),
  blockOrThana: z.string().min(2, "Block / Thana required"),
  district: z.string().min(2, "District required"),
});

export type CustomerInfoFormValues = z.infer<typeof CustomerInfoSchema>;
