import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class ContextService {
  private static readonly als = new AsyncLocalStorage<Map<string, any>>();

  /**
   * İsteği sarmalar ve bir hafıza alanı (store) oluşturur.
   */
  static run(callback: () => void) {
    const store = new Map<string, any>();
    this.als.run(store, callback);
  }

  /**
   * HTTP isteği dışındaki işleri (seed, zamanlanmış bakım) tenant kapsamı
   * uygulanmadan çalıştırır.
   *
   * PrismaService tenant bağlamı olmayan istekleri reddettiği için sistem
   * işlerinin kendini açıkça beyan etmesi gerekir. Bunu bir HTTP isteği
   * yolunda ASLA kullanmayın: kapsamı tamamen devre dışı bırakır.
   */
  static runAsSystem<T>(callback: () => Promise<T>): Promise<T> {
    const store = new Map<string, any>([['SYSTEM_TASK', true]]);
    return this.als.run(store, callback);
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
