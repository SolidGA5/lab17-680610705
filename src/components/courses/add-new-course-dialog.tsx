import { useMemo, useState } from "react";
import { Plus, PlusCircle, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useEnrollmentStore } from "@/lib/enrollment-store";
import { createCourseFormSchema, type CourseFormValues } from "@/lib/schemas/course-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, type DefaultValues } from "react-hook-form";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "../ui/switch";
import { FieldError } from "@/components/ui/field";

const MAXINSTRUTOR = 3;
const MININSTRUTOR = 1;

const emptyCourseForm: DefaultValues<CourseFormValues> = {
  courseId: "",
  courseTitle: "",
  instructors: [{ name: "", email: "" }],
  program: undefined,
  semester: undefined,
  description: "",
  notifyByEmail: false
};
/**
 *   (Lab 17): เขียนฟอร์มนี้ใหม่ด้วย Zod + React Hook Form
 *   (ดูตัวอย่างใน components/students/add-new-student-dialog.tsx)
 *   - schema ใหม่ที่ src/lib/schemas/course-schema.ts (แทน course-validation.ts)
 *   - ผู้สอนเป็น Array Fields (useFieldArray) — ชื่อ + อีเมล @cmu.ac.th, 1–3 คน
 *   - หลักสูตร (Select), ภาคการศึกษา (Radio Group), รายละเอียด (Textarea 0/100),
 *     รับข่าวสารทางอีเมล (Switch)
 */
export function AddNewCourseDialog() {
  const addCourse = useEnrollmentStore((s) => s.addCourse);
  const courses = useEnrollmentStore((s) => s.courses);
  const [open, setOpen] = useState(false);
  const schema = useMemo(() => createCourseFormSchema(courses), [courses]);
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyCourseForm,
    mode: "onBlur",
  });
  const CourseError =
    form.formState.errors.instructors?.root ?? form.formState.errors.instructors;



  function onSubmit(value: CourseFormValues) {
    addCourse(value)
    resetForm();
    setOpen(false)
  }


  const programChoice = [
    { value: "CPE", label: "CPE — วิศวกรรมคอมพิวเตอร" },
    { value: "ISNE", label: "ISNE — วิศวกรรมระบบสารสนเทศและเครือข่าย" }
  ]

  // ต้องต่อ id / aria-* / ข้อความ error เองทุกช่อง (<FormItem/FormControl/FormMessage> จะทำแทน)

  const resetForm = () => {
    form.reset(emptyCourseForm)
  };

  const { fields, append, remove
  } = useFieldArray({
    control: form.control,
    name: "instructors",
  });

  function InstructorsComponents({ index }: { index: number }) {
    return <FieldGroup className="gap-2">
      <FieldGroup className="flex flex-row items-center gap-2 w-full">
        <FieldDescription>{index + 1}.</FieldDescription>
        <Controller
          name={`instructors.${index}.name`}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="w-full" data-invalid={fieldState.invalid}>
              <Input className="w-full"
                id="name"
                placeholder="ชื่อผู้สอน"
                inputMode="text"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name={`instructors.${index}.email`}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="" data-invalid={fieldState.invalid}>
              <Input
                id="courseId"
                placeholder="name@cmu.ac.th"
                inputMode="text"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field className="w-5">
          <Button
            variant="ghost"
            disabled={fields.length == MININSTRUTOR}
            onClick={() => remove(index)}
          ><X></X></Button>
        </Field>
      </FieldGroup>
    </FieldGroup >
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusCircle className="h-4 w-4" />
        เพิ่มวิชา
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
            <DialogDescription>
              ลองใส่รหัสวิชาไม่ครบ 6 หลัก ใส่รหัสที่มีอยู่แล้ว ใส่อีเมลผู้สอนที่ไม่ใช่ @cmu.ac.th หรือพิมพ์รายละเอียดเกิน 100 ตัวอักษร แล้วกดบันทึก
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <div className="flex flex-row gap-5">
              <Controller
                name="courseId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="w-45" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="courseId">รหัสวิชา</FieldLabel>
                    <Input
                      id="courseId"
                      placeholder="เช่น 261305"
                      inputMode="numeric"
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="courseTitle"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="courseTitle" className="w-auto" data-invalid={fieldState.invalid}>ชื่อวิชา</FieldLabel>
                    <Input
                      id="courseTitle"
                      placeholder="เช่น Mobile Application Development"
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
          <FieldGroup>
            <Controller
              name="program"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="program">หลักสูตร</FieldLabel>
                  <Select
                    name={field.name}
                    items={programChoice}
                    value={field.value ?? null}
                    onValueChange={(v) => {
                      field.onChange(v);
                      field.onBlur();
                    }}
                  >
                    <SelectTrigger
                      id="program"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="เลือกหลักสูตร" />
                    </SelectTrigger>
                    <SelectContent>
                      {programChoice.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

          </FieldGroup>
          <FieldGroup className="gap-2">
            <FieldLabel>ภาคการศึกษา</FieldLabel>
            <Controller
              name="semester"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-2">
                  <RadioGroup className="flex flex-row gap-4"
                    value={field.value ?? null}
                    onValueChange={e => field.onChange(e)}
                  >
                    <Field orientation="horizontal" className="w-auto" data-invalid={fieldState.invalid}>
                      <RadioGroupItem id="1" value="1" aria-invalid={fieldState.invalid}
                      />
                      <FieldLabel htmlFor="plan-monthly" className="font-normal">
                        ภาคการศึกษาที่ 1
                      </FieldLabel>
                    </Field>
                    <Field orientation="horizontal" className="w-auto" data-invalid={fieldState.invalid}>
                      <RadioGroupItem value="2" id="2" aria-invalid={fieldState.invalid}
                      />
                      <FieldLabel htmlFor="plan-yearly" className="font-normal">
                        ภาคการศึกษาที่ 2
                      </FieldLabel>
                    </Field>
                    <Field orientation="horizontal" className="w-auto" data-invalid={fieldState.invalid}>
                      <RadioGroupItem value="3" id="3" aria-invalid={fieldState.invalid}
                      />
                      <FieldLabel htmlFor="plan-lifetime" className="font-normal">
                        ภาคฤดูร้อน
                      </FieldLabel>
                    </Field>
                  </RadioGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </div>
              )}
            />
          </FieldGroup>
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="feedback">รายละเอียด (ไม่บังคับ)</FieldLabel>
                <Textarea
                  id="feedback"
                  placeholder="คำอธิบายรายวิชาสั้นๆ"
                  rows={10}
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                <FieldDescription>
                  {field.value.length}/100 ตัวอักษร
                </FieldDescription>
              </Field>
            )}
          />
          <FieldLabel>ผู้สอน</FieldLabel>
          <FieldDescription>{fields.length}/3 คน — กรอกชื่อผู้สอน และอีเมล name@cmu.ac.th (ห้ามซ้ำกัน)</FieldDescription>
          {
            fields.map((item, index) => (<InstructorsComponents key={item.id}
              index={index}>
            </InstructorsComponents>))
          }
          {
            CourseError?.message && <FieldError errors={[CourseError]} />
          }

          <Button className="w-25" variant="outline" disabled={fields.length == MAXINSTRUTOR} onClick={() => append({ name: "", email: "" })}>
            <Plus></Plus> เพิ่มผู้สอน</Button>
          <FieldLabel htmlFor="kubernetes-r2h">
            <Controller
              name="notifyByEmail"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>รับข่าวสารทางอีเมล</FieldTitle>
                    <FieldDescription>
                      แจ้งเตือนผู้สอนเมื่อเปิดลงทะเบียน
                    </FieldDescription>
                  </FieldContent>
                  <Switch id="2fa" checked={field.value}
                    onCheckedChange={field.onChange} />
                </Field>
              )}
            />
          </FieldLabel>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              <RotateCcw className="h-4 w-4" />
              ล้างฟอร์ม
            </Button>
            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  );
}

