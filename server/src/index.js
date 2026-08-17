import 'dotenv/config'
import { buildApp } from './app.js'

const app = buildApp()
const port = process.env.PORT || 4000

app.listen(port, () => {
  console.log(`kranisa server listening on port ${port}`)
})
