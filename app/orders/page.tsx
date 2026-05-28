"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { collection, query, orderBy, onSnapshot, Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MoreVertical,
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
  Filter,
  Download,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "all"

interface Order {
  id: string
  customerName: string
  customerPhone: string
  customerAddress: string
  productName: string
  productPrice: number
  quantity: number
  total: number
  status: OrderStatus
  createdAt: Timestamp | Date
}

const statusConfig: Record<
  Exclude<OrderStatus, "all">,
  { label: string; color: string; icon: typeof Clock }
> = {
  pending: { label: "قيد الانتظار", color: "bg-warning/20 text-warning", icon: Clock },
  processing: { label: "قيد المعالجة", color: "bg-chart-2/20 text-chart-2", icon: RefreshCw },
  shipped: { label: "تم الشحن", color: "bg-chart-5/20 text-chart-5", icon: Truck },
  delivered: { label: "تم التسليم", color: "bg-primary/20 text-primary", icon: CheckCircle },
  cancelled: { label: "ملغي", color: "bg-destructive/20 text-destructive", icon: XCircle },
}

const navItems = [
  { icon: Home, label: "الرئيسية", href: "/", active: false },
  { icon: ShoppingCart, label: "الطلبات", href: "/orders", active: true },
  { icon: Package, label: "المنتجات", href: "/products", active: false },
  { icon: Users, label: "العملاء", href: "/customers", active: false },
  { icon: BarChart3, label: "التقارير", href: "/reports", active: false },
  { icon: Settings, label: "الإعدادات", href: "/settings", active: false },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
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

  const updateOrderStatus = async (orderId: string, newStatus: Exclude<OrderStatus, "all">) => {
    try {
      const orderRef = doc(db, "orders", orderId)
      await updateDoc(orderRef, { status: newStatus })
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  const deleteOrder = async (orderId: string) => {
    try {
      const orderRef = doc(db, "orders", orderId)
      await deleteDoc(orderRef)
    } catch (error) {
      console.error("Error deleting order:", error)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id?.includes(searchQuery) ||
      order.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone?.includes(searchQuery)
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return { date: "-", time: "-" }
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp)
    return {
      date: date.toLocaleDateString("ar-EG"),
      time: date.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    }
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
                <h2 className="text-xl font-bold text-foreground">
                  إدارة الطلبات
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredOrders.length} طلب
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="hidden sm:flex text-foreground border-border">
                <Download className="w-4 h-4 ml-2" />
                تصدير
              </Button>
              <Button variant="ghost" size="icon" className="relative text-foreground">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم، الهاتف، المنتج..."
                className="pr-10 bg-secondary border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}>
              <SelectTrigger className="w-full sm:w-48 bg-secondary border-border">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue placeholder="فلترة الحالة" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="processing">قيد المعالجة</SelectItem>
                <SelectItem value="shipped">تم الشحن</SelectItem>
                <SelectItem value="delivered">تم التسليم</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                جميع الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground text-right">رقم الطلب</TableHead>
                        <TableHead className="text-muted-foreground text-right">العميل</TableHead>
                        <TableHead className="text-muted-foreground text-right hidden sm:table-cell">العنوان</TableHead>
                        <TableHead className="text-muted-foreground text-right">المنتج</TableHead>
                        <TableHead className="text-muted-foreground text-right hidden lg:table-cell">الكمية</TableHead>
                        <TableHead className="text-muted-foreground text-right">الإجمالي</TableHead>
                        <TableHead className="text-muted-foreground text-right">الحالة</TableHead>
                        <TableHead className="text-muted-foreground text-right hidden md:table-cell">التاريخ</TableHead>
                        <TableHead className="text-muted-foreground text-right w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => {
                        const status = statusConfig[order.status as Exclude<OrderStatus, "all">] || statusConfig.pending
                        const StatusIcon = status.icon
                        const { date, time } = formatDate(order.createdAt)
                        return (
                          <TableRow key={order.id} className="border-border">
                            <TableCell className="font-mono text-sm text-foreground">
                              #{order.id.slice(-6)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground">{order.customerName || "غير محدد"}</p>
                                <a
                                  href={`tel:${order.customerPhone}`}
                                  className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                >
                                  <Phone className="w-3 h-3" />
                                  {order.customerPhone || "-"}
                                </a>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground max-w-[200px] truncate">
                                <MapPin className="w-3 h-3 shrink-0" />
                                {order.customerAddress || "-"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                                {order.productName || "غير محدد"}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-foreground">
                              {order.quantity || 1}
                            </TableCell>
                            <TableCell className="font-semibold text-foreground">
                              {(order.total || 0).toLocaleString("ar-EG")} ج.م
                            </TableCell>
                            <TableCell>
                              <Badge className={`${status.color} border-0 gap-1`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm hidden md:table-cell">
                              <div>
                                <p>{date}</p>
                                <p className="text-xs">{time}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-popover border-border">
                                  <DropdownMenuItem asChild>
                                    <a href={`tel:${order.customerPhone}`} className="text-primary">
                                      <Phone className="w-4 h-4 ml-2" />
                                      اتصال بالعميل
                                    </a>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "processing")} className="text-chart-2">
                                    <RefreshCw className="w-4 h-4 ml-2" />
                                    قيد المعالجة
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "shipped")} className="text-chart-5">
                                    <Truck className="w-4 h-4 ml-2" />
                                    تم الشحن
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "delivered")} className="text-primary">
                                    <CheckCircle className="w-4 h-4 ml-2" />
                                    تم التسليم
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => deleteOrder(order.id)} className="text-destructive">
                                    <XCircle className="w-4 h-4 ml-2" />
                                    حذف الطلب
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {!isLoading && filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <PackageSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد طلبات</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
