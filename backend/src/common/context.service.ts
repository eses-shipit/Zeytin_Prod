import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class ContextService {
  // Statik instance, böylece her yerden erişilebilir (istenirse)
  // Ama biz Dependency Injection kullanacağız.
  private static readonly als = new AsyncLocalStorage<Map<string, any>>();

  /**
   * İsteği sarmalar ve bir hafıza alanı (store) oluşturur.
   */
  static run(callback: () => void) {
    const store = new Map<string, any>();
    this.als.run(store, callback);
  }

  /**
   * Context'e veri yazar.
   */
  set(key: string, value: any) {
    const store = ContextService.als.getStore();
    if (store) {
      store.set(key, value);
    }
  }

  /**
   * Context'ten veri okur.
   */
  get(key: string) {
    const store = ContextService.als.getStore();
    return store?.get(key);
  }
}
