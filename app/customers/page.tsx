"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  Package,
  Search,
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
  Phone,
  MapPin,
  Users,
  Mail,
  ShoppingBag,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Order {
  id: string
  customerName: string
  customerPhone: string
  customerAddress: string
  total: number
  createdAt: Timestamp | Date
}

interface Customer {
  name: string
  phone: string
  address: string
  ordersCount: number
  totalSpent: number
  lastOrder: Date
}

const navItems = [
  { icon: Home, label: "الرئيسية", href: "/", active: false },
  { icon: ShoppingCart, label: "الطلبات", href: "/orders", active: false },
  { icon: Package, label: "المنتجات", href: "/products", active: false },
  { icon: Users, label: "العملاء", href: "/customers", active: true },
  { icon: BarChart3, label: "التقارير", href: "/reports", active: false },
  { icon: Settings, label: "الإعدادات", href: "/settings", active: false },
]

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders: Order[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[]

        // Aggregate customers from orders
        const customerMap = new Map<string, Customer>()
        orders.forEach((order) => {
          const phone = order.customerPhone || "unknown"
          if (customerMap.has(phone)) {
            const existing = customerMap.get(phone)!
            existing.ordersCount++
            existing.totalSpent += order.total || 0
          } else {
            const createdAt = order.createdAt instanceof Timestamp 
              ? order.createdAt.toDate() 
              : new Date(order.createdAt)
            customerMap.set(phone, {
              name: order.customerName || "غير معروف",
              phone: phone,
              address: order.customerAddress || "",
              ordersCount: 1,
              totalSpent: order.total || 0,
              lastOrder: createdAt,
            })
          }
        })

        setCustomers(Array.from(customerMap.values()))
        setIsLoading(false)
      },
      (error) => {
        console.error("Error fetching customers:", error)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
                <h2 className="text-xl font-bold text-foreground">العملاء</h2>
                <p className="text-sm text-muted-foreground">{filteredCustomers.length} عميل</p>
              </div>
            </div>

            <Button variant="ghost" size="icon" className="relative text-foreground">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو الهاتف..."
                className="pr-10 bg-secondary border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
                    <p className="text-2xl font-bold text-foreground">{customers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                    <p className="text-2xl font-bold text-foreground">
                      {customers.reduce((sum, c) => sum + c.ordersCount, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">متوسط الطلبات</p>
                    <p className="text-2xl font-bold text-foreground">
                      {customers.length > 0 
                        ? (customers.reduce((sum, c) => sum + c.ordersCount, 0) / customers.length).toFixed(1)
                        : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customers Table */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                قائمة العملاء
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">جاري تحميل العملاء...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground text-right">العميل</TableHead>
                        <TableHead className="text-muted-foreground text-right">الهاتف</TableHead>
                        <TableHead className="text-muted-foreground text-right hidden sm:table-cell">العنوان</TableHead>
                        <TableHead className="text-muted-foreground text-right">الطلبات</TableHead>
                        <TableHead className="text-muted-foreground text-right">إجمالي المشتريات</TableHead>
                        <TableHead className="text-muted-foreground text-right w-20" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.phone} className="border-border">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-primary/20 text-primary">
                                  {customer.name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground">{customer.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  آخر طلب: {customer.lastOrder.toLocaleDateString("ar-EG")}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <a
                              href={`tel:${customer.phone}`}
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-4 h-4" />
                              {customer.phone}
                            </a>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground max-w-[200px] truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {customer.address || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                              {customer.ordersCount} طلب
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            {customer.totalSpent.toLocaleString("ar-EG")} ج.م
                          </TableCell>
                          <TableCell>
                            <a href={`tel:${customer.phone}`}>
                              <Button variant="ghost" size="icon" className="text-primary">
                                <Phone className="w-4 h-4" />
                              </Button>
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {!isLoading && filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا يوجد عملاء</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
