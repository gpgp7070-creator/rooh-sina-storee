"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Package,
  Bell,
  Settings,
  Home,
  ShoppingCart,
  BarChart3,
  PackageSearch,
  UserCircle,
  LogOut,
  ChevronLeft,
  Users,
  Store,
  Palette,
  Globe,
  Shield,
  CreditCard,
  Truck as TruckIcon,
  MessageSquare,
  Save,
  Check,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const navItems = [
  { icon: Home, label: "الرئيسية", href: "/", active: false },
  { icon: ShoppingCart, label: "الطلبات", href: "/orders", active: false },
  { icon: Package, label: "المنتجات", href: "/products", active: false },
  { icon: Users, label: "العملاء", href: "/customers", active: false },
  { icon: BarChart3, label: "التقارير", href: "/reports", active: false },
  { icon: Settings, label: "الإعدادات", href: "/settings", active: true },
]

const settingsSections = [
  { icon: Store, label: "معلومات المتجر", id: "store" },
  { icon: CreditCard, label: "الدفع", id: "payment" },
  { icon: TruckIcon, label: "الشحن", id: "shipping" },
  { icon: MessageSquare, label: "الإشعارات", id: "notifications" },
  { icon: Shield, label: "الأمان", id: "security" },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("store")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-l border-sidebar-border">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <PackageSearch className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground">متجري</h1>
              <p className="text-xs text-muted-foreground">لوحة التحكم</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? "bg-sidebar-accent text-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback className="bg-primary/20 text-primary">
                <UserCircle className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-sidebar-foreground">أحمد المدير</p>
              <p className="text-xs text-muted-foreground">مدير المتجر</p>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="md:hidden">
                <Button variant="ghost" size="icon" className="text-foreground">
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              </Link>
              <div>
                <h2 className="text-xl font-bold text-foreground">الإعدادات</h2>
                <p className="text-sm text-muted-foreground">إدارة إعدادات المتجر</p>
              </div>
            </div>

            <Button 
              onClick={handleSave}
              className="bg-primary text-primary-foreground"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 ml-2" />
                  تم الحفظ
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Settings Navigation */}
            <div className="lg:w-64 shrink-0">
              <Card className="bg-card border-border">
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {settingsSections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right ${
                          activeSection === section.id
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        <section.icon className="w-5 h-5" />
                        <span>{section.label}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="flex-1 space-y-6">
              {activeSection === "store" && (
                <>
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <Store className="w-5 h-5 text-primary" />
                        معلومات المتجر
                      </CardTitle>
                      <CardDescription>المعلومات الأساسية للمتجر</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="storeName">اسم المتجر</Label>
                          <Input id="storeName" defaultValue="متجري" className="bg-secondary border-border" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="storePhone">رقم الهاتف</Label>
                          <Input id="storePhone" defaultValue="+20 100 000 0000" className="bg-secondary border-border" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="storeEmail">البريد الإلكتروني</Label>
                        <Input id="storeEmail" type="email" defaultValue="contact@mystore.com" className="bg-secondary border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="storeAddress">العنوان</Label>
                        <Textarea id="storeAddress" defaultValue="القاهرة، مصر" className="bg-secondary border-border" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        الإعدادات الإقليمية
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>العملة</Label>
                          <Select defaultValue="egp">
                            <SelectTrigger className="bg-secondary border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                              <SelectItem value="egp">جنيه مصري (ج.م)</SelectItem>
                              <SelectItem value="sar">ريال سعودي (ر.س)</SelectItem>
                              <SelectItem value="aed">درهم إماراتي (د.إ)</SelectItem>
                              <SelectItem value="usd">دولار أمريكي ($)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>اللغة</Label>
                          <Select defaultValue="ar">
                            <SelectTrigger className="bg-secondary border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                              <SelectItem value="ar">العربية</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {activeSection === "payment" && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      طرق الدفع
                    </CardTitle>
                    <CardDescription>إدارة طرق الدفع المتاحة</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">الدفع عند الاستلام</p>
                          <p className="text-xs text-muted-foreground">يدفع العميل عند استلام الطلب</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-chart-2" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">تحويل بنكي</p>
                          <p className="text-xs text-muted-foreground">تحويل مباشر للحساب البنكي</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">محافظ إلكترونية</p>
                          <p className="text-xs text-muted-foreground">فودافون كاش، اتصالات كاش</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeSection === "shipping" && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <TruckIcon className="w-5 h-5 text-primary" />
                      إعدادات الشحن
                    </CardTitle>
                    <CardDescription>إدارة خيارات الشحن والتوصيل</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shippingCost">تكلفة الشحن الافتراضية</Label>
                        <Input id="shippingCost" type="number" defaultValue="50" className="bg-secondary border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="freeShipping">الشحن المجاني من</Label>
                        <Input id="freeShipping" type="number" defaultValue="500" className="bg-secondary border-border" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>وقت التوصيل المتوقع</Label>
                      <Select defaultValue="3-5">
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="1-2">1-2 أيام</SelectItem>
                          <SelectItem value="3-5">3-5 أيام</SelectItem>
                          <SelectItem value="5-7">5-7 أيام</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeSection === "notifications" && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      الإشعارات
                    </CardTitle>
                    <CardDescription>إدارة إعدادات الإشعارات</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">إشعارات الطلبات الجديدة</p>
                        <p className="text-xs text-muted-foreground">تلقي إشعار عند وصول طلب جديد</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">إشعارات البريد الإلكتروني</p>
                        <p className="text-xs text-muted-foreground">إرسال نسخة من الطلبات للبريد</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">تنبيهات المخزون</p>
                        <p className="text-xs text-muted-foreground">تنبيه عند انخفاض المخزون</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeSection === "security" && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      الأمان
                    </CardTitle>
                    <CardDescription>إعدادات الأمان وكلمة المرور</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                      <Input id="currentPassword" type="password" className="bg-secondary border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                      <Input id="newPassword" type="password" className="bg-secondary border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                      <Input id="confirmPassword" type="password" className="bg-secondary border-border" />
                    </div>
                    <Button className="bg-primary text-primary-foreground">
                      تغيير كلمة المرور
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
