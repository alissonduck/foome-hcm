/**
 * Componente de informações pessoais do funcionário
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { translateMaritalStatus, translateEducationLevel, formatCPF, formatPhone } from "@/lib/utils"

/**
 * Props para o componente EmployeePersonalInfo
 */
interface EmployeePersonalInfoProps {
  employee: any
}

/**
 * Componente de informações pessoais do funcionário
 * @param employee Dados do funcionário
 * @returns Componente de informações pessoais
 */
export default function EmployeePersonalInfo({ employee }: EmployeePersonalInfoProps) {
  // Extrai o endereço do funcionário
  const address = employee.address || {}

  // Extrai o contato de emergência do funcionário
  const emergencyContact = employee.emergency_contact || {}

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>informações básicas</CardTitle>
          <CardDescription>dados pessoais do funcionário</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">nome completo</span>
              <span className="font-medium">{employee.full_name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">email</span>
              <span className="font-medium">{employee.email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">telefone</span>
              <span className="font-medium">{employee.phone ? formatPhone(employee.phone) : "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">cpf</span>
              <span className="font-medium">{employee.cpf ? formatCPF(employee.cpf) : "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">rg</span>
              <span className="font-medium">{employee.rg || "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">estado civil</span>
              <span className="font-medium">
                {employee.marital_status ? translateMaritalStatus(employee.marital_status) : "não informado"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">escolaridade</span>
              <span className="font-medium">
                {employee.education_level ? translateEducationLevel(employee.education_level) : "não informado"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">dependentes</span>
              <span className="font-medium">{employee.dependents || "não informado"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>endereço</CardTitle>
          <CardDescription>endereço residencial do funcionário</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">rua</span>
              <span className="font-medium">{address.street || "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">número</span>
              <span className="font-medium">{address.number || "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">complemento</span>
              <span className="font-medium">{address.complement || "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">bairro</span>
              <span className="font-medium">{address.neighborhood || "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">cidade</span>
              <span className="font-medium">{address.city || "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">estado</span>
              <span className="font-medium">{address.state || "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">cep</span>
              <span className="font-medium">{address.zipCode || "não informado"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>contato de emergência</CardTitle>
          <CardDescription>pessoa para contato em caso de emergência</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">nome</span>
              <span className="font-medium">{emergencyContact.name || "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">parentesco</span>
              <span className="font-medium">{emergencyContact.relationship || "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">telefone</span>
              <span className="font-medium">
                {emergencyContact.phone ? formatPhone(emergencyContact.phone) : "não informado"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

