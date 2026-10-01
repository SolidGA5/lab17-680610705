import { ConfirmDeleteButton } from "@/components/confirm-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import { Badge } from "../ui/badge";

export function CourseTable() {
  const courses = useEnrollmentStore((s) => s.courses);
  const removeCourse = useEnrollmentStore((s) => s.removeCourse);
  function findSemeter(id: string) {
    return [{ id: "1", label: "	ภาคการศึกษาที่ 1" }, { id: "2", label: "	ภาคการศึกษาที่ 2" }, { id: "3", label: "	ภาคฤดูร้อน" }]
      .find(i => i.id == id)?.label;
  }
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>รหัสวิชา</TableHead>
            <TableHead>ชื่อวิชา</TableHead>
            <TableHead>หลักสูตร</TableHead>
            <TableHead>ภาคการศึกษา</TableHead>
            <TableHead>รายละเอียด</TableHead>
            <TableHead>ผู้สอน</TableHead>
            <TableHead>รับข่าวสารทางอีเมล</TableHead>
            <TableHead className="w-20">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-20 text-center text-muted-foreground"
              >
                ยังไม่มีวิชาที่เปิดสอน
              </TableCell>
            </TableRow>
          )}
          {courses.map((course) => (
            <TableRow key={course.courseId}>
              <TableCell>{course.courseId}</TableCell>
              <TableCell>{course.courseTitle}</TableCell>
              <TableCell><Badge variant="outline">{course.program}</Badge></TableCell>
              <TableCell>{findSemeter(course.semester!)}</TableCell>
              <TableCell className="opacity-50">{course.description === "" ? "—" : course.description}</TableCell>
              <TableCell>
                {/* แสดงรายชื่อผู้สอนเป็นข้อความธรรมดา คั่นด้วย ", " */}
                {course.instructors.length === 0 ? (
                  <span className="text-muted-foreground">ยังไม่มีผู้สอน</span>
                ) : (
                  <div className="flex flex-col">
                    {
                      course.instructors.map(c =>
                        <div className="grid grid-rows-2">
                          <div>
                            {c.name}
                          </div>
                          <div className="opacity-50 w-3/10">{c.email}</div>
                        </div>
                      )
                    }
                  </div>
                )}
              </TableCell>
              <TableCell>
                {course.notifyByEmail ? (
                  // รับ: white on dark, gray on light
                  <Badge className="bg-gray-300 text-black dark:bg-white dark:text-black">
                    รับ
                  </Badge>
                ) : (
                  // ไม่รับ: dark gray on dark, white on light
                  <Badge className="bg-white text-black border dark:bg-neutral-800 dark:text-white dark:border-transparent">
                    ไม่รับ
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <ConfirmDeleteButton
                  label={`ลบวิชา ${course.courseId}`}
                  title="ลบวิชา?"
                  description={`ลบ ${course.courseId} — ${course.courseTitle} ออกจากรายวิชาที่เปิดสอน พร้อมการลงทะเบียนทั้งหมดของวิชานี้`}
                  onConfirm={() => removeCourse(course.courseId)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
