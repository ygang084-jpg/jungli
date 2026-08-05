import { createApp } from './app'
import { env } from './config/env'

const app = createApp()

app.listen(env.port, () => {
  console.log(`서버가 http://localhost:${env.port} 에서 실행 중입니다.`)
})
