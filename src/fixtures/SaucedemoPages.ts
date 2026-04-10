import { BrowserContext, Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { InventoryPage } from "../pages/InventoryPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { CartPage } from "../pages/CartPage";
import { CheckoutStep1Page } from "../pages/CheckoutStep1Page";
import { CheckoutStep2Page } from "../pages/CheckoutStep2Page";
import { CheckoutCompletePage } from "../pages/CheckoutCompletePage";
import { Sidebar } from "../pages/components/Sidebar";

export class SaucedemoPages {
  constructor(
    public readonly page: Page,
    public readonly context: BrowserContext,
  ) {}

  private _loginPage?: LoginPage;
  private _inventoryPage?: InventoryPage;
  private _productDetail?: ProductDetailPage;
  private _cartPage?: CartPage;
  private _checkoutStep1?: CheckoutStep1Page;
  private _checkoutStep2?: CheckoutStep2Page;
  private _checkoutComplete?: CheckoutCompletePage;
  private _sidebar?: Sidebar;

  get loginPage() {
    return (this._loginPage ??= new LoginPage(this.page));
  }
  get inventoryPage() {
    return (this._inventoryPage ??= new InventoryPage(this.page));
  }
  get productDetail() {
    return (this._productDetail ??= new ProductDetailPage(this.page));
  }
  get cartPage() {
    return (this._cartPage ??= new CartPage(this.page));
  }
  get checkoutStep1() {
    return (this._checkoutStep1 ??= new CheckoutStep1Page(this.page));
  }
  get checkoutStep2() {
    return (this._checkoutStep2 ??= new CheckoutStep2Page(this.page));
  }
  get checkoutComplete() {
    return (this._checkoutComplete ??= new CheckoutCompletePage(this.page));
  }
  get sidebar() {
    return (this._sidebar ??= new Sidebar(this.page));
  }
}
