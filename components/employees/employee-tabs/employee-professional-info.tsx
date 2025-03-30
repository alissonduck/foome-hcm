/**
 * Componente de informações profissionais do funcionário
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatCNPJ } from "@/lib/utils"

/**
 * Props para o componente EmployeeProfessionalInfo
 */
interface EmployeeProfessionalInfoProps {
  employee: any
}

/**
 * Componente de informações profissionais do funcionário
 * @param employee Dados do funcionário
 * @returns Componente de informações profissionais
 */
export default function EmployeeProfessionalInfo({ employee }: EmployeeProfessionalInfoProps) {
  // Extrai as informações bancárias do funcionário
  const bankInfo = employee.bank_info || {}

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>informações profissionais</CardTitle>
          <CardDescription>dados profissionais do funcionário</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">cargo</span>
              <span className="font-medium">{employee.position || "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">departamento</span>
              <span className="font-medium">{employee.department || "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">tipo de contrato</span>
              <span className="font-medium">{employee.contract_type === "clt" ? "CLT" : "PJ"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">data de admissão</span>
              <span className="font-medium">
                {employee.hire_date ? formatDate(employee.hire_date) : "não informado"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {employee.contract_type === "clt" ? (
        <Card>
          <CardHeader>
            <CardTitle>dados clt</CardTitle>
            <CardDescription>informações específicas para contrato clt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">pis</span>
                <span className="font-medium">{employee.pis || "não informado"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">ctps</span>
                <span className="font-medium">{employee.ctps || "não informado"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>dados pj</CardTitle>
            <CardDescription>informações específicas para contrato pj</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">cnpj</span>
                <span className="font-medium">{employee.cnpj ? formatCNPJ(employee.cnpj) : "não informado"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">nome da empresa</span>
                <span className="font-medium">{employee.company_name || "não informado"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">descrição do serviço</span>
                <span className="font-medium">{employee.service_description || "não informado"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>dados bancários</CardTitle>
          <CardDescription>informações bancárias para pagamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">banco</span>
              <span className="font-medium">{bankInfo.bankName || "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">tipo de conta</span>
              <span className="font-medium">
                {bankInfo.accountType === "checking"
                  ? "corrente"
                  : bankInfo.accountType === "savings"
                    ? "poupança"
                    : "não informado"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">agência</span>
              <span className="font-medium">{bankInfo.agency || "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">conta</span>
              <span className="font-medium">{bankInfo.account || "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">chave pix</span>
              <span className="font-medium">{bankInfo.pixKey || "não informado"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

