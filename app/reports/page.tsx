"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
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
  RefreshCw,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Order {
  id: string
  customerName: string
  customerPhone: string
  total: number
  status: string
  productName: string
  createdAt: Timestamp | Date
}

const navItems = [
  { icon: Home, label: "الرئيسية", href: "/", active: false },
  { icon: ShoppingCart, label: "الطلبات", href: "/orders", active: false },
  { icon: Package, label: "المنتجات", href: "/products", active: false },
  { icon: Users, label: "العملاء", href: "/customers", active: false },
  { icon: BarChart3, label: "التقارير", href: "/reports", active: true },
  { icon: Settings, label: "الإعدادات", href: "/settings", active: false },
]

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData: Order[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[]
        setOrders(ordersData)
        setIsLoading(false)
      },
      (error) => {
        console.error("Error fetching orders:", error)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const totalOrders = orders.length
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const uniqueCustomers = new Set(orders.map((o) => o.customerPhone)).size
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Top products
  const productCounts = orders.reduce((acc, order) => {
    const product = order.productName || "غير محدد"
    acc[product] = (acc[product] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Top customers by spending
  const customerSpending = orders.reduce((acc, order) => {
    const phone = order.customerPhone || "unknown"
    if (!acc[phone]) {
      acc[phone] = { name: order.customerName || "غير معروف", total: 0, orders: 0 }
    }
    acc[phone].total += order.total || 0
    acc[phone].orders++
    return acc
  }, {} as Record<string, { name: string; total: number; orders: number }>)

  const topCustomers = Object.entries(customerSpending)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)

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
                <h2 className="text-xl font-bold text-foreground">التقارير والإحصائيات</h2>
                <p className="text-sm text-muted-foreground">نظرة شاملة على أداء المتجر</p>
              </div>
            </div>

            <Button variant="ghost" size="icon" className="relative text-foreground">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">جاري تحميل التقارير...</p>
            </div>
          ) : (
            <>
              {/* Main Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                          {totalRevenue.toLocaleString("ar-EG")} ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{totalOrders}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-chart-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">متوسط قيمة الطلب</p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                          {avgOrderValue.toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-warning" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{uniqueCustomers}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-chart-5/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-chart-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Status Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <ArrowUpRight className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">تم التسليم</p>
                        <p className="text-2xl font-bold text-foreground">{deliveredOrders}</p>
                        <p className="text-xs text-primary">
                          {totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0}% من الطلبات
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-warning" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">قيد الانتظار</p>
                        <p className="text-2xl font-bold text-foreground">{pendingOrders}</p>
                        <p className="text-xs text-warning">
                          {totalOrders > 0 ? ((pendingOrders / totalOrders) * 100).toFixed(1) : 0}% من الطلبات
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                        <ArrowDownRight className="w-6 h-6 text-destructive" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ملغية</p>
                        <p className="text-2xl font-bold text-foreground">{cancelledOrders}</p>
                        <p className="text-xs text-destructive">
                          {totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : 0}% من الطلبات
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Products & Customers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      المنتجات الأكثر مبيعا
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topProducts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">لا توجد بيانات</p>
                    ) : (
                      <div className="space-y-4">
                        {topProducts.map(([product, count], index) => (
                          <div key={product} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{product}</p>
                              <p className="text-xs text-muted-foreground">{count} طلب</p>
                            </div>
                            <div className="w-24 bg-secondary rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${(count / topProducts[0][1]) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      أفضل العملاء
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topCustomers.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">لا توجد بيانات</p>
                    ) : (
                      <div className="space-y-4">
                        {topCustomers.map(([phone, data], index) => (
                          <div key={phone} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-chart-5/20 flex items-center justify-center text-chart-5 font-bold text-sm">
                              {index + 1}
                            </div>
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary/20 text-primary text-sm">
                                {data.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{data.name}</p>
                              <p className="text-xs text-muted-foreground">{data.orders} طلب</p>
                            </div>
                            <p className="font-semibold text-foreground">
                              {data.total.toLocaleString("ar-EG")} ج.م
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
