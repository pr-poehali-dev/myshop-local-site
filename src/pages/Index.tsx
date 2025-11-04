import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Order {
  id: string;
  orderNumber: string;
  dateFrom: string;
  dateTo: string;
  customerName: string;
  customerPhone: string;
  executor: string;
  telegram: string;
  status: 'processing' | 'inProgress' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  services: string[];
  notes?: string;
  createdAt: Date;
  completedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
}

interface Customer {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isProcessingDialogOpen, setIsProcessingDialogOpen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newServiceName, setNewServiceName] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [newServicePrice, setNewServicePrice] = useState('');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [receiptText, setReceiptText] = useState('');
  const [isCompletedDialogOpen, setIsCompletedDialogOpen] = useState(false);
  const [isCustomServiceDialogOpen, setIsCustomServiceDialogOpen] = useState(false);
  const [customService, setCustomService] = useState({ name: '', price: '', note: '' });

  const [newOrder, setNewOrder] = useState({
    dateFrom: '',
    dateTo: '',
    customerName: '',
    customerPhone: '',
    executor: '',
    telegram: '',
    services: [] as string[],
    notes: ''
  });

  useEffect(() => {
    const authStatus = localStorage.getItem('myshop_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const loadData = () => {
    const savedOrders = localStorage.getItem('myshop_orders');
    const savedCustomers = localStorage.getItem('myshop_customers');
    const savedServices = localStorage.getItem('myshop_services');

    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedServices) setServices(JSON.parse(savedServices));
  };

  const saveData = (type: 'orders' | 'customers' | 'services', data: any) => {
    localStorage.setItem(`myshop_${type}`, JSON.stringify(data));
  };

  const handleLogin = () => {
    if (password === 'easyshop25') {
      setIsAuthenticated(true);
      localStorage.setItem('myshop_auth', 'true');
      loadData();
      toast.success('Добро пожаловать в MyShop!');
    } else {
      toast.error('Неверный пароль');
    }
  };

  const generateOrderNumber = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const generateReceipt = (order: Order) => {
    const total = order.services.reduce((sum, name) => {
      const service = services.find(s => s.name === name);
      if (service) return sum + service.price;
      const match = name.match(/\((\d+)\s*₽\)/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);

    const currentDate = new Date().toLocaleDateString('ru-RU');
    
    const receipt = `
╔═══════════════════════════════════════╗
          СЧЁТ НА ОПЛАТУ УСЛУГ
╚═══════════════════════════════════════╝

Номер заказа: ${order.orderNumber}
Дата выставления: ${currentDate}

────────────────────────────────────────
ИНФОРМАЦИЯ О ЗАКАЗЧИКЕ
────────────────────────────────────────
Клиент: ${order.customerName}
Телефон: ${order.customerPhone}
Telegram: ${order.telegram}

────────────────────────────────────────
ИНФОРМАЦИЯ ОБ УСЛУГАХ
────────────────────────────────────────
Период выполнения: ${order.dateFrom} — ${order.dateTo}
Ответственный исполнитель: ${order.executor}

────────────────────────────────────────
ПЕРЕЧЕНЬ УСЛУГ
────────────────────────────────────────
${order.services.map((name, idx) => {
  const service = services.find(s => s.name === name);
  let price = service?.price || 0;
  if (!service) {
    const match = name.match(/\((\d+)\s*₽\)/);
    price = match ? parseInt(match[1]) : 0;
  }
  return `${idx + 1}. ${name.padEnd(30)} ${price.toLocaleString('ru-RU')} ₽`;
}).join('\n')}

────────────────────────────────────────
ИТОГО К ОПЛАТЕ: ${total.toLocaleString('ru-RU')} ₽
────────────────────────────────────────
${order.notes ? `
ПРИМЕЧАНИЯ
────────────────────────────────────────
${order.notes}
────────────────────────────────────────
` : ''}
Спасибо за обращение!
EasyAdventure.Shop © ${new Date().getFullYear()}
`;
    
    return receipt;
  };

  const handleCreateOrder = () => {
    setIsOrderDialogOpen(false);
    setIsProcessingDialogOpen(true);
    setProcessingStatus('loading');

    setTimeout(() => {
      const orderNumber = generateOrderNumber();
      const order: Order = {
        id: Date.now().toString(),
        orderNumber,
        ...newOrder,
        status: 'inProgress',
        createdAt: new Date()
      };

      const updatedOrders = [...orders, order];
      setOrders(updatedOrders);
      saveData('orders', updatedOrders);
      setProcessingStatus('success');

      setTimeout(() => {
        setIsProcessingDialogOpen(false);
        const receipt = generateReceipt(order);
        setReceiptText(receipt);
        setIsReceiptDialogOpen(true);
        setNewOrder({
          dateFrom: '',
          dateTo: '',
          customerName: '',
          customerPhone: '',
          executor: '',
          telegram: '',
          services: [],
          notes: ''
        });
        toast.success(`Заказ №${orderNumber} создан`);
      }, 1500);
    }, 2000);
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const now = new Date();
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const updates: Partial<Order> = { status: newStatus };
        if (newStatus === 'completed') updates.completedAt = now;
        if (newStatus === 'rejected') updates.rejectedAt = now;
        if (newStatus === 'cancelled') updates.cancelledAt = now;
        return { ...order, ...updates };
      }
      return order;
    });
    setOrders(updatedOrders);
    saveData('orders', updatedOrders);

    if (newStatus === 'completed') {
      setIsCompletedDialogOpen(true);
    }
  };

  const deleteOrder = (orderId: string) => {
    const updatedOrders = orders.filter(order => order.id !== orderId);
    setOrders(updatedOrders);
    saveData('orders', updatedOrders);
    toast.success('Заказ удалён');
  };

  const addCustomer = () => {
    if (!newCustomerName.trim()) return;
    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomerName
    };
    const updatedCustomers = [...customers, customer];
    setCustomers(updatedCustomers);
    saveData('customers', updatedCustomers);
    setNewCustomerName('');
    setIsCustomerDialogOpen(false);
    toast.success('Покупатель добавлен');
  };

  const deleteCustomer = (id: string) => {
    const updatedCustomers = customers.filter(c => c.id !== id);
    setCustomers(updatedCustomers);
    saveData('customers', updatedCustomers);
    toast.success('Покупатель удалён');
  };

  const addService = () => {
    if (!newServiceName.trim()) return;
    const service: Service = {
      id: Date.now().toString(),
      name: newServiceName,
      price: parseFloat(newServicePrice) || 0
    };
    const updatedServices = [...services, service];
    setServices(updatedServices);
    saveData('services', updatedServices);
    setNewServiceName('');
    setNewServicePrice('');
    setIsServiceDialogOpen(false);
    toast.success('Услуга добавлена');
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    const updatedServices = services.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    setServices(updatedServices);
    saveData('services', updatedServices);
  };

  const copyReceipt = () => {
    navigator.clipboard.writeText(receiptText);
    toast.success('Чек скопирован в буфер обмена!');
  };

  const deleteService = (id: string) => {
    const updatedServices = services.filter(s => s.id !== id);
    setServices(updatedServices);
    saveData('services', updatedServices);
    toast.success('Услуга удалена');
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setNewOrder({
      dateFrom: order.dateFrom,
      dateTo: order.dateTo,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      executor: order.executor,
      telegram: order.telegram,
      services: order.services,
      notes: order.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  const saveEditedOrder = () => {
    if (!selectedOrder) return;
    const updatedOrders = orders.map(order =>
      order.id === selectedOrder.id ? { ...order, ...newOrder } : order
    );
    setOrders(updatedOrders);
    saveData('orders', updatedOrders);
    setIsEditDialogOpen(false);
    setSelectedOrder(null);
    setNewOrder({
      dateFrom: '',
      dateTo: '',
      customerName: '',
      customerPhone: '',
      executor: '',
      telegram: '',
      services: [],
      notes: ''
    });
    toast.success('Заказ обновлён');
  };

  const getStatusInfo = (status: Order['status']) => {
    const statusMap = {
      processing: { label: 'Обработка', color: 'bg-blue-500' },
      inProgress: { label: 'Выполняется', color: 'bg-yellow-500' },
      accepted: { label: 'Принято', color: 'bg-green-500' },
      rejected: { label: 'Отклонено', color: 'bg-red-500' },
      completed: { label: 'Выполнено', color: 'bg-green-600' },
      cancelled: { label: 'Отменено', color: 'bg-gray-500' }
    };
    return statusMap[status];
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.includes(searchQuery) ||
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-full max-w-md shadow-lg animate-scale-in">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-2">
              <Icon name="ShoppingBag" size={32} className="text-white" />
            </div>
            <CardTitle className="text-3xl font-semibold">MyShop</CardTitle>
            <CardDescription>Введите пароль для входа</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="h-12"
              />
            </div>
            <Button onClick={handleLogin} className="w-full h-12 text-base font-medium">
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50 no-print">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Icon name="ShoppingBag" size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold">EasyAdventure.Shop</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const data = {
                    orders,
                    customers,
                    services,
                    exportDate: new Date().toISOString()
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `myshop-backup-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast.success('Данные экспортированы');
                }}
              >
                <Icon name="Download" size={18} className="mr-2" />
                Экспорт
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.json';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target?.result as string);
                        if (data.orders) {
                          setOrders(data.orders);
                          saveData('orders', data.orders);
                        }
                        if (data.customers) {
                          setCustomers(data.customers);
                          saveData('customers', data.customers);
                        }
                        if (data.services) {
                          setServices(data.services);
                          saveData('services', data.services);
                        }
                        toast.success('Данные импортированы');
                      } catch (err) {
                        toast.error('Ошибка импорта данных');
                      }
                    };
                    reader.readAsText(file);
                  };
                  input.click();
                }}
              >
                <Icon name="Upload" size={18} className="mr-2" />
                Импорт
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.print()}
              >
                <Icon name="Printer" size={18} className="mr-2" />
                Печать
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAuthenticated(false);
                  localStorage.removeItem('myshop_auth');
                }}
              >
                <Icon name="LogOut" size={18} className="mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 h-12 no-print">
            <TabsTrigger value="orders" className="text-base">Заказы</TabsTrigger>
            <TabsTrigger value="people" className="text-base">Люди</TabsTrigger>
            <TabsTrigger value="services" className="text-base">Услуги</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Всего заказов</p>
                    <p className="text-3xl font-bold text-primary">{orders.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Выполнено</p>
                    <p className="text-3xl font-bold text-accent">{orders.filter(o => o.status === 'completed').length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">В работе</p>
                    <p className="text-3xl font-bold text-yellow-500">{orders.filter(o => o.status === 'inProgress' || o.status === 'accepted').length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск по номеру или имени"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button onClick={() => setIsOrderDialogOpen(true)} className="h-12 px-6">
                <Icon name="Plus" size={20} className="mr-2" />
                Создать заказ
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <Card 
                    key={order.id} 
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsOrderDetailOpen(true);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">Заказ №{order.orderNumber}</h3>
                            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <p className="text-muted-foreground">{order.customerName}</p>
                            <p className="text-muted-foreground">{order.executor}</p>
                            <p className="text-xs text-muted-foreground">{order.dateFrom} — {order.dateTo}</p>
                            {order.services.length > 0 && (
                              <p className="text-xs text-muted-foreground">{order.services.length} услуг</p>
                            )}
                          </div>
                        </div>
                        <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredOrders.length === 0 && (
                <Card className="py-12">
                  <CardContent className="text-center text-muted-foreground">
                    {searchQuery ? 'Заказы не найдены' : 'Нет заказов'}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="people" className="space-y-6 animate-fade-in">
            <Button onClick={() => setIsCustomerDialogOpen(true)} className="h-12 px-6">
              <Icon name="Plus" size={20} className="mr-2" />
              Добавить покупателя
            </Button>

            <div className="grid gap-4">
              {customers.map((customer) => (
                <Card key={customer.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="User" size={20} className="text-primary" />
                      </div>
                      <p className="font-medium">{customer.name}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteCustomer(customer.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {customers.length === 0 && (
                <Card className="py-12">
                  <CardContent className="text-center text-muted-foreground">
                    Нет покупателей
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6 animate-fade-in">
            <Button onClick={() => setIsServiceDialogOpen(true)} className="h-12 px-6">
              <Icon name="Plus" size={20} className="mr-2" />
              Добавить услугу
            </Button>

            <div className="grid gap-4">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                        <Icon name="Briefcase" size={20} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.price} ₽</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingService(service);
                          setNewServiceName(service.name);
                          setNewServicePrice(service.price.toString());
                          setIsServiceDialogOpen(true);
                        }}
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteService(service.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {services.length === 0 && (
                <Card className="py-12">
                  <CardContent className="text-center text-muted-foreground">
                    Нет услуг
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Создать заказ</DialogTitle>
            <DialogDescription>Заполните информацию о заказе</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Дата с</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={newOrder.dateFrom}
                  onChange={(e) => setNewOrder({ ...newOrder, dateFrom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">Дата до</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={newOrder.dateTo}
                  onChange={(e) => setNewOrder({ ...newOrder, dateTo: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Имя покупателя</Label>
              <Select
                value={newOrder.customerName}
                onValueChange={(value) => setNewOrder({ ...newOrder, customerName: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите покупателя" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.name}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Номер телефона</Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={newOrder.customerPhone}
                onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="executor">Кто выполняет заказ</Label>
              <Select
                value={newOrder.executor}
                onValueChange={(value) => setNewOrder({ ...newOrder, executor: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите исполнителя" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="@arinzz0h">@arinzz0h</SelectItem>
                  <SelectItem value="@VirtMG">@VirtMG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram</Label>
              <Input
                id="telegram"
                placeholder="@username"
                value={newOrder.telegram}
                onChange={(e) => setNewOrder({ ...newOrder, telegram: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Услуги</Label>
              <div className="flex flex-wrap gap-2">
                {services.map((service) => (
                  <Badge
                    key={service.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                    onClick={() => {
                      setNewOrder({
                        ...newOrder,
                        services: [...newOrder.services, service.name]
                      });
                    }}
                  >
                    {service.name} ({service.price} ₽)
                  </Badge>
                ))}
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                  onClick={() => setIsCustomServiceDialogOpen(true)}
                >
                  Прочее
                </Badge>
              </div>
              {newOrder.services.length > 0 && (
                <div className="mt-3 space-y-2">
                  <Label className="text-sm font-medium">Выбранные услуги:</Label>
                  <div className="flex flex-wrap gap-2">
                    {newOrder.services.map((serviceName, idx) => {
                      const service = services.find(s => s.name === serviceName);
                      return (
                        <Badge
                          key={idx}
                          variant="default"
                          className="cursor-pointer"
                          onClick={() => {
                            setNewOrder({
                              ...newOrder,
                              services: newOrder.services.filter((_, i) => i !== idx)
                            });
                          }}
                        >
                          {serviceName} ({service?.price} ₽) ✕
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Примечания</Label>
              <Input
                id="notes"
                placeholder="Дополнительная информация"
                value={newOrder.notes}
                onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
              />
            </div>

            <Button onClick={handleCreateOrder} className="w-full h-12">
              Оформить заказ
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать заказ</DialogTitle>
            <DialogDescription>Измените информацию о заказе</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editDateFrom">Дата с</Label>
                <Input
                  id="editDateFrom"
                  type="date"
                  value={newOrder.dateFrom}
                  onChange={(e) => setNewOrder({ ...newOrder, dateFrom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDateTo">Дата до</Label>
                <Input
                  id="editDateTo"
                  type="date"
                  value={newOrder.dateTo}
                  onChange={(e) => setNewOrder({ ...newOrder, dateTo: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editCustomerName">Имя покупателя</Label>
              <Select
                value={newOrder.customerName}
                onValueChange={(value) => setNewOrder({ ...newOrder, customerName: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите покупателя" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.name}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editCustomerPhone">Номер телефона</Label>
              <Input
                id="editCustomerPhone"
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={newOrder.customerPhone}
                onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editExecutor">Кто выполняет заказ</Label>
              <Select
                value={newOrder.executor}
                onValueChange={(value) => setNewOrder({ ...newOrder, executor: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите исполнителя" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="@arinzz0h">@arinzz0h</SelectItem>
                  <SelectItem value="@VirtMG">@VirtMG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editTelegram">Telegram</Label>
              <Input
                id="editTelegram"
                placeholder="@username"
                value={newOrder.telegram}
                onChange={(e) => setNewOrder({ ...newOrder, telegram: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Услуги</Label>
              <div className="flex flex-wrap gap-2">
                {services.map((service) => (
                  <Badge
                    key={service.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                    onClick={() => {
                      setNewOrder({
                        ...newOrder,
                        services: [...newOrder.services, service.name]
                      });
                    }}
                  >
                    {service.name} ({service.price} ₽)
                  </Badge>
                ))}
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                  onClick={() => setIsCustomServiceDialogOpen(true)}
                >
                  Прочее
                </Badge>
              </div>
              {newOrder.services.length > 0 && (
                <div className="mt-3 space-y-2">
                  <Label className="text-sm font-medium">Выбранные услуги:</Label>
                  <div className="flex flex-wrap gap-2">
                    {newOrder.services.map((serviceName, idx) => {
                      const service = services.find(s => s.name === serviceName);
                      return (
                        <Badge
                          key={idx}
                          variant="default"
                          className="cursor-pointer"
                          onClick={() => {
                            setNewOrder({
                              ...newOrder,
                              services: newOrder.services.filter((_, i) => i !== idx)
                            });
                          }}
                        >
                          {serviceName} ({service?.price} ₽) ✕
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="editNotes">Примечания</Label>
              <Input
                id="editNotes"
                placeholder="Дополнительная информация"
                value={newOrder.notes}
                onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
              />
            </div>

            <Button onClick={saveEditedOrder} className="w-full h-12">
              Сохранить изменения
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Заказ №{selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>{selectedOrder?.dateFrom} — {selectedOrder?.dateTo}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge className={getStatusInfo(selectedOrder.status).color}>
                  {getStatusInfo(selectedOrder.status).label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Покупатель</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Телефон</p>
                  <p className="font-medium">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Исполнитель</p>
                  <p className="font-medium">{selectedOrder.executor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Telegram</p>
                  <p className="font-medium">{selectedOrder.telegram}</p>
                </div>
                {selectedOrder.completedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Выполнен</p>
                    <p className="font-medium text-accent">{new Date(selectedOrder.completedAt).toLocaleString('ru-RU')}</p>
                  </div>
                )}
                {selectedOrder.rejectedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Отклонён</p>
                    <p className="font-medium text-destructive">{new Date(selectedOrder.rejectedAt).toLocaleString('ru-RU')}</p>
                  </div>
                )}
                {selectedOrder.cancelledAt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Отменён</p>
                    <p className="font-medium text-muted-foreground">{new Date(selectedOrder.cancelledAt).toLocaleString('ru-RU')}</p>
                  </div>
                )}
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Примечания</p>
                  <p className="p-3 bg-secondary rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              {selectedOrder.services.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Услуги</p>
                  <div className="space-y-2">
                    {selectedOrder.services.map((serviceName, idx) => {
                      const service = services.find(s => s.name === serviceName);
                      let price = service?.price || 0;
                      if (!service) {
                        const match = serviceName.match(/\((\d+)\s*₽\)/);
                        price = match ? parseInt(match[1]) : 0;
                      }
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <span>{serviceName}</span>
                          <span className="font-medium">{price} ₽</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Итого:</span>
                      <span>{selectedOrder.services.reduce((sum, name) => {
                        const service = services.find(s => s.name === name);
                        if (service) return sum + service.price;
                        const match = name.match(/\((\d+)\s*₽\)/);
                        return sum + (match ? parseInt(match[1]) : 0);
                      }, 0)} ₽</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {selectedOrder.status === 'inProgress' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'rejected');
                        setIsOrderDetailOpen(false);
                      }}
                      className="flex-1"
                    >
                      Отклонено
                    </Button>
                    <Button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'accepted');
                        setIsOrderDetailOpen(false);
                      }}
                      className="flex-1 bg-accent hover:bg-accent/90"
                    >
                      Принято
                    </Button>
                  </>
                )}

                {selectedOrder.status === 'accepted' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'cancelled');
                        setIsOrderDetailOpen(false);
                      }}
                      className="flex-1"
                    >
                      Отменено
                    </Button>
                    <Button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'completed');
                        setIsOrderDetailOpen(false);
                      }}
                      className="flex-1 bg-accent hover:bg-accent/90"
                    >
                      Выполнено
                    </Button>
                  </>
                )}

                {(selectedOrder.status === 'cancelled' || selectedOrder.status === 'rejected') && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleEditOrder(selectedOrder);
                      setIsOrderDetailOpen(false);
                    }}
                    className="flex-1"
                  >
                    <Icon name="Edit" size={16} className="mr-2" />
                    Редактировать
                  </Button>
                )}
                
                {selectedOrder.status === 'completed' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const receipt = generateReceipt(selectedOrder);
                      setReceiptText(receipt);
                      setIsReceiptDialogOpen(true);
                    }}
                    className="flex-1"
                  >
                    <Icon name="FileText" size={16} className="mr-2" />
                    Показать чек
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={() => {
                    deleteOrder(selectedOrder.id);
                    setIsOrderDetailOpen(false);
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Удалить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Чек заказа</DialogTitle>
            <DialogDescription>Скопируйте чек для отправки клиенту</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-secondary p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap font-mono">{receiptText}</pre>
            </div>
            <Button onClick={copyReceipt} className="w-full h-12">
              <Icon name="Copy" size={20} className="mr-2" />
              Скопировать чек
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCompletedDialogOpen} onOpenChange={setIsCompletedDialogOpen}>
        <DialogContent className="max-w-sm">
          <div className="text-center py-6 space-y-4 animate-scale-in">
            <div className="w-20 h-20 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
              <Icon name="CheckCircle2" size={40} className="text-accent" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Заказ завершён!</h3>
              <p className="text-muted-foreground">Заказ успешно выполнен</p>
            </div>
            <Button onClick={() => setIsCompletedDialogOpen(false)} className="w-full">
              Отлично
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProcessingDialogOpen} onOpenChange={setIsProcessingDialogOpen}>
        <DialogContent className="max-w-sm">
          <div className="text-center py-6">
            {processingStatus === 'loading' && (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                  <Icon name="Loader2" size={32} className="text-primary animate-spin" />
                </div>
                <p className="text-lg font-medium">Заявка обрабатывается...</p>
              </div>
            )}

            {processingStatus === 'success' && (
              <div className="space-y-4 animate-scale-in">
                <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                  <Icon name="CheckCircle2" size={32} className="text-accent" />
                </div>
                <p className="text-lg font-medium">Заявка создана!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomServiceDialogOpen} onOpenChange={setIsCustomServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Кастомная услуга</DialogTitle>
            <DialogDescription>Добавьте детали услуги</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customServiceName">Название</Label>
              <Input
                id="customServiceName"
                placeholder="Введите название услуги"
                value={customService.name}
                onChange={(e) => setCustomService({ ...customService, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customServicePrice">Цена</Label>
              <Input
                id="customServicePrice"
                type="number"
                placeholder="Введите цену"
                value={customService.price}
                onChange={(e) => setCustomService({ ...customService, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customServiceNote">Примечание</Label>
              <Input
                id="customServiceNote"
                placeholder="Дополнительная информация"
                value={customService.note}
                onChange={(e) => setCustomService({ ...customService, note: e.target.value })}
              />
            </div>
            <Button onClick={() => {
              if (customService.name && customService.price) {
                const serviceName = `${customService.name} (${customService.price} ₽)${customService.note ? ` - ${customService.note}` : ''}`;
                setNewOrder({
                  ...newOrder,
                  services: [...newOrder.services, serviceName]
                });
                setCustomService({ name: '', price: '', note: '' });
                setIsCustomServiceDialogOpen(false);
                toast.success('Услуга добавлена');
              } else {
                toast.error('Заполните название и цену');
              }
            }} className="w-full h-12">
              Добавить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить покупателя</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Имя покупателя</Label>
              <Input
                id="customerName"
                placeholder="Введите имя"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomer()}
              />
            </div>
            <Button onClick={addCustomer} className="w-full">
              Добавить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isServiceDialogOpen} onOpenChange={(open) => {
        setIsServiceDialogOpen(open);
        if (!open) {
          setEditingService(null);
          setNewServiceName('');
          setNewServicePrice('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? 'Редактировать услугу' : 'Добавить услугу'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceName">Название услуги</Label>
              <Input
                id="serviceName"
                placeholder="Введите название"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servicePrice">Цена (₽)</Label>
              <Input
                id="servicePrice"
                type="number"
                placeholder="0"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (editingService ? updateService(editingService.id, { name: newServiceName, price: parseFloat(newServicePrice) || 0 }) && setIsServiceDialogOpen(false) : addService())}
              />
            </div>
            <Button onClick={() => {
              if (editingService) {
                updateService(editingService.id, { name: newServiceName, price: parseFloat(newServicePrice) || 0 });
                setIsServiceDialogOpen(false);
                setEditingService(null);
                setNewServiceName('');
                setNewServicePrice('');
                toast.success('Услуга обновлена');
              } else {
                addService();
              }
            }} className="w-full">
              {editingService ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;