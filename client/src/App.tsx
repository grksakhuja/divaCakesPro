import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/layout";
import Home from "@/pages/home";
import CakeBuilder from "@/pages/cake-builder";
import OrderConfirmation from "@/pages/order-confirmation";
import AdminOrders from "@/pages/admin-orders";
import AdminLogin from "@/pages/admin-login";
import NotFound from "@/pages/not-found";
import Gallery from "@/pages/gallery";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Cakes from "@/pages/cakes";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Layout>
          <Home />
        </Layout>
      </Route>
      <Route path="/order">
        <Layout showFooter={false}>
          <CakeBuilder />
        </Layout>
      </Route>
      <Route path="/order-confirmation">
        <Layout>
          <OrderConfirmation />
        </Layout>
      </Route>
      <Route path="/gallery">
        <Layout>
          <Gallery />
        </Layout>
      </Route>
      <Route path="/about">
        <Layout>
          <About />
        </Layout>
      </Route>
      <Route path="/contact">
        <Layout>
          <Contact />
        </Layout>
      </Route>
      <Route path="/cakes">
        <Layout>
          <Cakes />
        </Layout>
      </Route>
      <Route path="/cart">
        <Layout>
          <Cart />
        </Layout>
      </Route>
      <Route path="/checkout">
        <Layout>
          <Checkout />
        </Layout>
      </Route>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
