"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { PushNotifications } from '@capacitor/push-notifications';
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase" // اتأكد إن مسار الـ auth صح
import {
  Package,
  TrendingUp,
  DollarSign,
  Users,
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

// Order status types
type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

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
  OrderStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  pending: { label: "قيد الانتظار", color: "bg-warning/20 text-warning", icon: Clock },
  processing: { label: "قيد المعالجة", color: "bg-chart-2/20 text-chart-2", icon: RefreshCw },
  shipped: { label: "تم الشحن", color: "bg-chart-5/20 text-chart-5", icon: Truck },
  delivered: { label: "تم التسليم", color: "bg-primary/20 text-primary", icon: CheckCircle },
  cancelled: { label: "ملغي", color: "bg-destructive/20 text-destructive", icon: XCircle },
}

const navItems = [
  { icon: Home, label: "الرئيسية", href: "/", active: true },
  { icon: ShoppingCart, label: "الطلبات", href: "/orders", active: false },
  { icon: Package, label: "المنتجات", href: "/products", active: false },
  { icon: Users, label: "العملاء", href: "/customers", active: false },
  { icon: BarChart3, label: "التقارير", href: "/reports", active: false },
  { icon: Settings, label: "الإعدادات", href: "/settings", active: false },
]

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLive, setIsLive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const isFirstLoad = useRef(true)

  const playNotificationSound = () => {
    if (!isSoundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTone = (time: number, freq: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + duration);
      };

      playTone(audioCtx.currentTime, 587.33, 0.15);
      playTone(audioCtx.currentTime + 0.2, 880, 0.25);
    } catch (e) {
      console.error("خطأ أثناء تشغيل الصوت:", e);
    }
  };
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.push("/login")
    } else {
      setLoading(false)
    }
  })

  return () => unsubscribe()
}, [router])

  useEffect(() => {
    setIsMounted(true);

    const setupPushNotifications = async () => {
      try {
        let permStatus = await PushNotifications.checkPermissions();
        
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          console.log("لم يتم إعطاء إذن الإشعارات للموبايل");
          return;
        }

        await PushNotifications.register();

        await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('وصل إشعار جديد في الأندرويد: ', notification);
          
          playNotificationSound(); 

          alert(`🔔 طلب جديد! \n${notification.title}: ${notification.body}`);
        });

        await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('المستخدم ضغط على الإشعار:', notification);
        });

      } catch (error) {
        console.error("خطأ في تهيئة إشعارات Capacitor:", error);
      }
    };

    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      setupPushNotifications();
    }
  }, [isSoundEnabled]);

  useEffect(() => {
    if (!isLive) return

    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData: Order[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            customerName: data.customerName || "غير محدد",
            customerPhone: data.customerPhone || "",
            customerAddress: data.customerAddress || "",
            productName: data.productName || "منتج غير محدد",
            productPrice: Number(data.productPrice) || 0,
            quantity: Number(data.quantity) || 1,
            total: Number(data.total) || Number(data.productPrice) || 0,
            status: (data.status || "pending") as OrderStatus,
            createdAt: data.createdAt || new Date(),
          }
        })
        
        if (!isFirstLoad.current && snapshot.docChanges().some(change => change.type === "added")) {
          playNotificationSound();
        }

        setOrders(ordersData)
        setLastUpdate(new Date())
        setIsLoading(false)
        isFirstLoad.current = false;
      },
      (error) => {
        console.error("Error fetching orders:", error)
        setIsLoading(false)
      }
    )
    return () => unsubscribe()
  }, [isLive, isSoundEnabled])


  const filteredOrders = orders.filter(
    (order) =>
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id?.includes(searchQuery) ||
      order.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone?.includes(searchQuery)
  )

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    customers: new Set(orders.map((o) => o.customerPhone).filter(Boolean)).size,
  }

  const formatDate = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return { date: "-", time: "-" }
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp)
    return {
      date: date.toLocaleDateString("ar-EG"),
      time: date.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    }
  }
  if (loading) {
  return <div>جاري التحقق...</div>
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
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-foreground"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  مرحبا بك، أحمد
                </h2>
                <p className="text-sm text-muted-foreground">
                  آخر تحديث:{" "}
                  {isMounted ? (
                    lastUpdate.toLocaleTimeString("ar-EG", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  ) : (
                    "جاري التحميل..."
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  className="w-64 pr-10 bg-secondary border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Button
                variant={isLive ? "default" : "outline"}
                size="sm"
                onClick={() => setIsLive(!isLive)}
                className={isLive ? "bg-primary text-primary-foreground" : ""}
              >
                <span
                  className={`w-2 h-2 rounded-full ml-2 ${
                    isLive ? "bg-primary-foreground animate-pulse" : "bg-muted-foreground"
                  }`}
                />
                {isLive ? "مباشر" : "متوقف"}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative text-foreground"
                onClick={() => setIsSoundEnabled(!isSoundEnabled)} // يتيح لك كتم صوت التنبيه من زر الجرس
              >
                <Bell className={`w-5 h-5 ${isSoundEnabled ? "text-primary" : "text-muted-foreground"}`} />
                {stats.pendingOrders > 0 && (
                  <span className="absolute -top-1 -left-1 w-5 h-5 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground">
                    {stats.pendingOrders}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {stats.totalOrders}
                    </p>
                    <p className="text-xs text-primary mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      تحديث مباشر
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">طلبات معلقة</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {stats.pendingOrders}
                    </p>
                    <p className="text-xs text-warning mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      تحتاج مراجعة
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">الإيرادات</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {stats.revenue.toLocaleString("ar-EG")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">ج.م</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-chart-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">العملاء</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {stats.customers}
                    </p>
                    <p className="text-xs text-primary mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      إجمالي العملاء
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-chart-5/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-chart-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  الطلبات الأخيرة
                  {isLive && (
                    <Badge variant="outline" className="border-primary text-primary text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-1" />
                      مباشر
                    </Badge>
                  )}
                </CardTitle>
                <Link href="/orders">
                  <Button variant="outline" size="sm" className="text-foreground border-border">
                    عرض الكل
                  </Button>
                </Link>
              </div>
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
                        <TableHead className="text-muted-foreground text-right">
                          رقم الطلب
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          العميل
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right hidden sm:table-cell">
                          المنتج
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right hidden lg:table-cell">
                          الكمية
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          الإجمالي
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          الحالة
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right hidden md:table-cell">
                          التاريخ
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.slice(0, 10).map((order, index) => {
                        const status = statusConfig[order.status] || statusConfig.pending
                        const StatusIcon = status.icon
                        const { date, time } = formatDate(order.createdAt)
                        return (
                          <TableRow
                            key={order.id}
                            className={`border-border transition-all ${
                              index === 0 && isLive
                                ? "animate-in fade-in slide-in-from-top-2 duration-500"
                                : ""
                            }`}
                          >
                            <TableCell className="font-mono text-sm text-foreground">
                              #{order.id.slice(-6)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-secondary text-xs text-foreground">
                                    {order.customerName?.slice(0, 2) || "؟"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-foreground">
                                    {order.customerName || "غير محدد"}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={`tel:${order.customerPhone}`}
                                      className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                      <Phone className="w-3 h-3" />
                                      {order.customerPhone || "-"}
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge
                                variant="secondary"
                                className="text-xs bg-secondary text-secondary-foreground"
                              >
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
                              <Badge
                                className={`${status.color} border-0 gap-1`}
                              >
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
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8 text-muted-foreground"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-popover border-border"
                                >
                                  <DropdownMenuItem className="text-popover-foreground">
                                    <MapPin className="w-4 h-4 ml-2" />
                                    {order.customerAddress || "لا يوجد عنوان"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <a href={`tel:${order.customerPhone}`} className="text-primary">
                                      <Phone className="w-4 h-4 ml-2" />
                                      اتصال بالعميل
                                    </a>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <XCircle className="w-4 h-4 ml-2" />
                                    إلغاء الطلب
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
                  <p className="text-muted-foreground">
                    {searchQuery ? "لا توجد طلبات مطابقة للبحث" : "لا توجد طلبات بعد"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    أضف طلبات في مجلد orders في Firestore
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
