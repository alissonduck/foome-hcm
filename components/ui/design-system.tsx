/**
 * Componente de demonstração do Design System
 */
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/ui/logo"
import { Check, AlertTriangle, Info } from "lucide-react"

/**
 * Componente de demonstração do Design System
 * @returns Página de demonstração dos componentes do Design System
 */
export default function DesignSystem() {
  return (
    <div className="p-6 space-y-10">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Logo</h2>
        <div className="flex flex-wrap gap-8 items-center">
          <Logo />
          <Logo width={80} height={30} />
          <Logo width={150} height={50} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Cores</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <div className="h-20 w-full bg-primary rounded-lg"></div>
            <p className="text-sm font-medium">Primary</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 w-full bg-secondary rounded-lg"></div>
            <p className="text-sm font-medium">Secondary</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 w-full bg-accent rounded-lg"></div>
            <p className="text-sm font-medium">Accent</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 w-full bg-destructive rounded-lg"></div>
            <p className="text-sm font-medium">Destructive</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 w-full bg-success rounded-lg"></div>
            <p className="text-sm font-medium">Success</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 w-full bg-warning rounded-lg"></div>
            <p className="text-sm font-medium">Warning</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Tipografia</h2>
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold">Título H1</h1>
            <p className="text-sm text-muted-foreground">text-4xl font-bold</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Título H2</h2>
            <p className="text-sm text-muted-foreground">text-3xl font-bold</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold">Título H3</h3>
            <p className="text-sm text-muted-foreground">text-2xl font-bold</p>
          </div>
          <div>
            <h4 className="text-xl font-bold">Título H4</h4>
            <p className="text-sm text-muted-foreground">text-xl font-bold</p>
          </div>
          <div>
            <p className="text-base">Texto padrão</p>
            <p className="text-sm text-muted-foreground">text-base</p>
          </div>
          <div>
            <p className="text-sm">Texto pequeno</p>
            <p className="text-sm text-muted-foreground">text-sm</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Botões</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Badges</h2>
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <Button>Action</Button>
            </CardFooter>
          </Card>

          <Card className="foome-card">
            <CardHeader>
              <CardTitle>Foome Card</CardTitle>
              <CardDescription>Com estilo personalizado</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <Button className="foome-button-primary">Action</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Formulários</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="seu@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="******" />
            </div>
            <Button>Enviar</Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-email">Email</Label>
              <div className="relative">
                <Info className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="custom-email" className="foome-input pl-10" placeholder="seu@email.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-password">Senha</Label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="custom-password" className="foome-input pl-10" type="password" placeholder="******" />
              </div>
            </div>
            <Button className="foome-button-primary">Enviar</Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Tabs</h2>
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="p-4 border rounded-lg mt-2">
            <h3 className="font-medium">Account</h3>
            <p className="text-sm text-muted-foreground">Manage your account settings.</p>
          </TabsContent>
          <TabsContent value="password" className="p-4 border rounded-lg mt-2">
            <h3 className="font-medium">Password</h3>
            <p className="text-sm text-muted-foreground">Change your password here.</p>
          </TabsContent>
          <TabsContent value="settings" className="p-4 border rounded-lg mt-2">
            <h3 className="font-medium">Settings</h3>
            <p className="text-sm text-muted-foreground">Manage your settings.</p>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}

