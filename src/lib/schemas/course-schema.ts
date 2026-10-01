import { z } from "zod"
import type { Course } from "../types";


export const courseFormSchema = z.object({
  courseId: z
    .string()
    .regex(/^\d{6}$/, "รหัสวิชาต้องเป็นตัวเลข 6 หลัก"),
  courseTitle: z.string().min(1, "กรอกชื่อวิชา").max(100, "ชื่อวิชายาวได้ไม่เกิน 100 ตัวอักษร"),
  program: z.enum(["CPE", "ISNE"], { error: "เลือกหลักสูตร" }),
  semester: z.enum(["1", "2", "3"], { error: "เลือกภาคการศึกษา" }),
  instructors: z.array(z.object(
    {
      name: z.string().min(1, "กรอกชื่อผู้สอน"),
      email: z.email("อีเมลไม่ถูกต้อง").endsWith("@cmu.ac.th", "ต้องเป็นอีเมล @cmu.ac.th")
    }
  )).refine(
    (items) =>
      new Set(items.map((i) => i.email.toLowerCase())).size ===
      items.length,
    "อีเมลผู้สอนซ้ำกัน",
  ),
  description: z.string().max(100, "รายละเอียดยาวได้ไม่เกิน 100 ตัวอักษร"),
  notifyByEmail: z.boolean()
})

export type CourseFormValues = z.infer<typeof courseFormSchema>;
export function createCourseFormSchema(existingCourses: Course[]) {
  return courseFormSchema
    .refine(
      (d) => !existingCourses.some((c) => c.courseId === d.courseId),
      { message: "รหัสวิชานี้มีอยู่แล้ว", path: ["courseId"] }
    )


}


