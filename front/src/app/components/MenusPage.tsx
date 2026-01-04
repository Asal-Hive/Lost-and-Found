import * as React from 'react';
import {
  Bot,
  LayoutGrid,
  List,
  MapPin,
  MessageCircle,
  Settings,
  ShieldAlert,
  User,
} from 'lucide-react';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './ui/navigation-menu';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from './ui/menubar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from './ui/sidebar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type DemoSection = 'map' | 'items' | 'chat' | 'profile' | 'admin';

export default function MenusPage() {
  const [section, setSection] = React.useState<DemoSection>('map');
  const [showLost, setShowLost] = React.useState(true);
  const [showFound, setShowFound] = React.useState(true);

  return (
    <div className="max-w-7xl mx-auto px-4" dir="rtl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">منوها و ناوبری (Menus)</h2>
        <p className="text-gray-600">
          نمونه‌ی آماده‌ی منوی بالا + سایدبار + منوی اکشن‌ها (قابل استفاده برای صفحه نقشه/لیست/چت‌بات)
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <SidebarProvider defaultOpen={true}>
          <Sidebar side="right" variant="inset" collapsible="icon">
            <SidebarHeader className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow">
                    <span className="text-white font-bold text-lg">L&F</span>
                  </div>
                  <div className="leading-tight">
                    <div className="font-bold">گم‌وگور دانشگاه</div>
                    <div className="text-xs text-muted-foreground">Demo App Shell</div>
                  </div>
                </div>
              </div>
            </SidebarHeader>

            <SidebarSeparator />

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>بخش‌ها</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={section === 'map'}
                        onClick={() => setSection('map')}
                      >
                        <MapPin />
                        <span>نقشه</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={section === 'items'}
                        onClick={() => setSection('items')}
                      >
                        <List />
                        <span>لیست آیتم‌ها</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={section === 'chat'}
                        onClick={() => setSection('chat')}
                      >
                        <Bot />
                        <span>چت‌بات جستجو</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={section === 'profile'}
                        onClick={() => setSection('profile')}
                      >
                        <User />
                        <span>پروفایل</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={section === 'admin'}
                        onClick={() => setSection('admin')}
                      >
                        <ShieldAlert />
                        <span>مدیریت گزارش‌ها</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">دانشجو: مهمان</div>
                <Button variant="outline" size="icon" title="تنظیمات">
                  <Settings />
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset>
            {/* Top bar */}
            <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b">
              <div className="flex items-center gap-3 p-3">
                <SidebarTrigger />

                <div className="flex-1">
                  <NavigationMenu viewport={false} className="w-full justify-start">
                    <NavigationMenuList className="justify-start">
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>امکانات</NavigationMenuTrigger>
                        <NavigationMenuContent className="w-[280px]">
                          <div className="grid gap-1">
                            <NavLink onClick={() => setSection('map')} title="نقشه" desc="پین‌ها + فیلتر مکانی" />
                            <NavLink onClick={() => setSection('items')} title="آیتم‌ها" desc="لیست و کارت‌ها" />
                            <NavLink onClick={() => setSection('chat')} title="چت‌بات" desc="جستجوی هوشمند" />
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>

                      <NavigationMenuItem>
                        <NavigationMenuLink
                          onClick={() => setSection('profile')}
                          className="cursor-pointer"
                        >
                          حساب کاربری
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                </div>

                <div className="hidden md:flex items-center gap-2 w-[360px]">
                  <Input placeholder="جستجو در عنوان/توضیحات…" />
                  <Button>جستجو</Button>
                </div>
              </div>

              <div className="px-3 pb-3">
                <Menubar dir="rtl" className="w-fit">
                  <MenubarMenu>
                    <MenubarTrigger>فیلتر</MenubarTrigger>
                    <MenubarContent>
                      <MenubarCheckboxItem
                        checked={showLost}
                        onCheckedChange={(v) => setShowLost(Boolean(v))}
                      >
                        نمایش «گمشده‌ها»
                      </MenubarCheckboxItem>
                      <MenubarCheckboxItem
                        checked={showFound}
                        onCheckedChange={(v) => setShowFound(Boolean(v))}
                      >
                        نمایش «پیدا شده‌ها»
                      </MenubarCheckboxItem>
                      <MenubarSeparator />
                      <MenubarItem>فقط امروز</MenubarItem>
                      <MenubarItem>این هفته</MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>

                  <MenubarMenu>
                    <MenubarTrigger>مرتب‌سازی</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>جدیدترین</MenubarItem>
                      <MenubarItem>نزدیک‌ترین به من</MenubarItem>
                      <MenubarItem>پرتکرارترین مکان</MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>

                  <MenubarMenu>
                    <MenubarTrigger>اکشن‌ها</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>ثبت مورد جدید</MenubarItem>
                      <MenubarItem>مکان فعلی من</MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              </div>
            </header>

            {/* Content */}
            <div className="p-4 md:p-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5" />
                      پیش‌نمایش بخش انتخاب‌شده
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border bg-muted/30 p-4">
                      <p className="font-medium mb-2">بخش فعال:</p>
                      <p className="text-sm text-muted-foreground">{labelFor(section)}</p>
                      <div className="mt-4 text-sm">
                        <p className="font-medium mb-2">فیلترها:</p>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• گمشده‌ها: {showLost ? 'روشن' : 'خاموش'}</li>
                          <li>• پیدا شده‌ها: {showFound ? 'روشن' : 'خاموش'}</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      نکته برای توسعه
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        این صفحه فقط «اسکلت منوها» را به شما می‌دهد تا راحت‌تر طراحی فیگما را به
                        React منتقل کنید.
                      </p>
                      <p>
                        در فاز بعدی می‌توانید هر بخش (نقشه/لیست/چت‌بات/پروفایل) را با React Router
                        مسیر‌بندی کنید.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}

function NavLink({
  title,
  desc,
  onClick,
}: {
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-right rounded-md p-3 hover:bg-accent transition-colors"
    >
      <div className="font-medium text-foreground">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </button>
  );
}

function labelFor(section: DemoSection) {
  switch (section) {
    case 'map':
      return 'نقشه (Pinpoints + رنگ‌بندی وضعیت + ثبت آیتم از روی نقشه)';
    case 'items':
      return 'لیست آیتم‌ها (کارت‌ها + فیلتر تگ + جستجو)';
    case 'chat':
      return 'چت‌بات (پیام کوتاه → پیشنهاد آیتم‌های مشابه)';
    case 'profile':
      return 'پروفایل (آیتم‌های من + ویرایش/حذف)';
    case 'admin':
      return 'مدیریت گزارش‌ها (حذف خودکار بعد از ۵ گزارش)';
    default:
      return '';
  }
}
