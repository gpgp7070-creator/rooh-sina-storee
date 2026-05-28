"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { collection, query, onSnapshot } from "firebase/firestore"
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
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
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
  productName: string
  productPrice: number
  quantity: number
}

interface ProductStats {
  name: string
  price: number
  soldCount: number
  revenue: number
}

const navItems = [
  { icon: Home, label: "الرئيسية", href: "/", active: false },
  { icon: ShoppingCart, label: "الطلبات", href: "/orders", active: false },
  { icon: Package, label: "المنتجات", href: "/products", active: true },
  { icon: Users, label: "العملاء", href: "/customers", active: false },
  { icon: BarChart3, label: "التقارير", href: "/reports", active: false },
  { icon: Settings, label: "الإعدادات", href: "/settings", active: false },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductStats[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const ordersRef = collection(db, "orders")
    const q = query(ordersRef)

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders: Order[] = snapshot.docs.map((doc) => doc.data()) as Order[]

        // Aggregate products from orders
        const productMap = new Map<string, ProductStats>()
        orders.forEach((order) => {
          const name = order.productName || "غير محدد"
          if (productMap.has(name)) {
            const existing = productMap.get(name)!
            existing.soldCount += order.quantity || 1
            existing.revenue += (order.productPrice || 0) * (order.quantity || 1)
          } else {
            productMap.set(name, {
              name: name,
              price: order.productPrice || 0,
              soldCount: order.quantity || 1,
              revenue: (order.productPrice || 0) * (order.quantity || 1),
            })
          }
        })

        setProducts(Array.from(productMap.values()).sort((a, b) => b.soldCount - a.soldCount))
        setIsLoading(false)
      },
      (error) => {
        console.error("Error fetching products:", error)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalProducts = products.length
  const totalSold = products.reduce((sum, p) => sum + p.soldCount, 0)
  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0)

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
                <h2 className="text-xl font-bold text-foreground">المنتجات</h2>
                <p className="text-sm text-muted-foreground">{filteredProducts.length} منتج</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button className="bg-primary text-primary-foreground hidden sm:flex">
                <Plus className="w-4 h-4 ml-2" />
                إضافة منتج
              </Button>
              <Button variant="ghost" size="icon" className="relative text-foreground">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن منتج..."
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
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي المنتجات</p>
                    <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                    <p className="text-2xl font-bold text-foreground">{totalSold} قطعة</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                    <p className="text-2xl font-bold text-foreground">{totalRevenue.toLocaleString("ar-EG")} ج.م</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Table */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                قائمة المنتجات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground text-right">المنتج</TableHead>
                        <TableHead className="text-muted-foreground text-right">السعر</TableHead>
                        <TableHead className="text-muted-foreground text-right">المباع</TableHead>
                        <TableHead className="text-muted-foreground text-right">الإيرادات</TableHead>
                        <TableHead className="text-muted-foreground text-right w-28">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product, index) => (
                        <TableRow key={product.name} className="border-border">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                                <Package className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{product.name}</p>
                                <p className="text-xs text-muted-foreground">#{index + 1}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {product.price.toLocaleString("ar-EG")} ج.م
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                              {product.soldCount} قطعة
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-primary">
                            {product.revenue.toLocaleString("ar-EG")} ج.م
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {!isLoading && filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد منتجات</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    المنتجات تظهر تلقائيا من الطلبات
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
