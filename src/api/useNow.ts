import { ref } from 'vue'

/** 每秒跳动一次的共享时钟，让「刚刚更新」之类的相对时间保持鲜活 */
export const now = ref(Date.now())

if (typeof window !== 'undefined') {
  window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
}
