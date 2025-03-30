/**
 * Componente de lista de cursos de um cargo
 * Exibe os cursos obrigatórios e complementares de um cargo
 */
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RoleCourse, RoleComplementaryCourse } from "@/lib/types/roles"
import { EmptyState } from "@/components/empty-state"

interface RoleCoursesListProps {
  courses: RoleCourse[]
  complementaryCourses: RoleComplementaryCourse[]
}

export function RoleCoursesList({ courses, complementaryCourses }: RoleCoursesListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Cursos</CardTitle>
          <CardDescription>Cursos necessários para o cargo</CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {courses.map((course) => (
                <Badge key={course.id} variant={course.is_required ? "default" : "outline"}>
                  {course.name}
                  {course.is_required && " (Obrigatório)"}
                </Badge>
              ))}
            </div>
          ) : (
            <EmptyState title="Nenhum curso" description="Este cargo não possui cursos definidos." className="h-40" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cursos Complementares</CardTitle>
          <CardDescription>Cursos complementares para o cargo</CardDescription>
        </CardHeader>
        <CardContent>
          {complementaryCourses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {complementaryCourses.map((course) => (
                <Badge key={course.id} variant="outline">
                  {course.name}
                </Badge>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhum curso complementar"
              description="Este cargo não possui cursos complementares definidos."
              className="h-40"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

