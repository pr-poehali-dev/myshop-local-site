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
  createdAt: Date;
}

interface Customer {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
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

  const [newOrder, setNewOrder] = useState({
    dateFrom: '',
    dateTo: '',
    customerName: '',
    customerPhone: '',
    executor: '',
    telegram: '',
    services: [] as string[]
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
        setNewOrder({
          dateFrom: '',
          dateTo: '',
          customerName: '',
          customerPhone: '',
          executor: '',
          telegram: '',
          services: []
        });
        toast.success(`Заказ №${orderNumber} создан`);
      }, 1500);
    }, 2000);
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    saveData('orders', updatedOrders);

    if (newStatus === 'completed') {
      toast.success('Заказ выполнен!');
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
      name: newServiceName
    };
    const updatedServices = [...services, service];
    setServices(updatedServices);
    saveData('services', updatedServices);
    setNewServiceName('');
    setIsServiceDialogOpen(false);
    toast.success('Услуга добавлена');
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
      services: order.services
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
      services: []
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
      <div className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Icon name="ShoppingBag" size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold">MyShop</h1>
            </div>
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

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 h-12">
            <TabsTrigger value="orders" className="text-base">Заказы</TabsTrigger>
            <TabsTrigger value="people" className="text-base">Люди</TabsTrigger>
            <TabsTrigger value="services" className="text-base">Услуги</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6 animate-fade-in">
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
                  <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Заказ №{order.orderNumber}</CardTitle>
                          <CardDescription className="mt-1">
                            {order.dateFrom} — {order.dateTo}
                          </CardDescription>
                        </div>
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Покупатель</p>
                          <p className="font-medium">{order.customerName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Телефон</p>
                          <p className="font-medium">{order.customerPhone}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Исполнитель</p>
                          <p className="font-medium">{order.executor}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Telegram</p>
                          <p className="font-medium">{order.telegram}</p>
                        </div>
                      </div>

                      {order.services.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Услуги</p>
                          <div className="flex flex-wrap gap-2">
                            {order.services.map((service, idx) => (
                              <Badge key={idx} variant="secondary">{service}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-2">
                        {order.status === 'inProgress' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'rejected')}
                              className="flex-1"
                            >
                              Отклонено
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'accepted')}
                              className="flex-1 bg-accent hover:bg-accent/90"
                            >
                              Принято
                            </Button>
                          </>
                        )}

                        {order.status === 'accepted' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              className="flex-1"
                            >
                              Отменено
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              className="flex-1 bg-accent hover:bg-accent/90"
                            >
                              Выполнено
                            </Button>
                          </>
                        )}

                        {(order.status === 'completed' || order.status === 'cancelled' || order.status === 'rejected') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditOrder(order)}
                            className="flex-1"
                          >
                            <Icon name="Edit" size={16} className="mr-2" />
                            Редактировать
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteOrder(order.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
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
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                        <Icon name="Briefcase" size={20} className="text-accent" />
                      </div>
                      <p className="font-medium">{service.name}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteService(service.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
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
                  <SelectItem value="Кулешова Арина">Кулешова Арина</SelectItem>
                  <SelectItem value="Яргунов Роман">Яргунов Роман</SelectItem>
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
                {services.map((service) => {
                  const isSelected = newOrder.services.includes(service.name);
                  return (
                    <Badge
                      key={service.id}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (isSelected) {
                          setNewOrder({
                            ...newOrder,
                            services: newOrder.services.filter(s => s !== service.name)
                          });
                        } else {
                          setNewOrder({
                            ...newOrder,
                            services: [...newOrder.services, service.name]
                          });
                        }
                      }}
                    >
                      {service.name}
                    </Badge>
                  );
                })}
              </div>
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
                  <SelectItem value="Кулешова Арина">Кулешова Арина</SelectItem>
                  <SelectItem value="Яргунов Роман">Яргунов Роман</SelectItem>
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
                {services.map((service) => {
                  const isSelected = newOrder.services.includes(service.name);
                  return (
                    <Badge
                      key={service.id}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (isSelected) {
                          setNewOrder({
                            ...newOrder,
                            services: newOrder.services.filter(s => s !== service.name)
                          });
                        } else {
                          setNewOrder({
                            ...newOrder,
                            services: [...newOrder.services, service.name]
                          });
                        }
                      }}
                    >
                      {service.name}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <Button onClick={saveEditedOrder} className="w-full h-12">
              Сохранить изменения
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

      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить услугу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceName">Название услуги</Label>
              <Input
                id="serviceName"
                placeholder="Введите название"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addService()}
              />
            </div>
            <Button onClick={addService} className="w-full">
              Добавить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
