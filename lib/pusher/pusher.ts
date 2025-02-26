import PusherServer from 'pusher'
import PusherClient from 'pusher-js'
import { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET } from '../utils'

export const pusherServer = new PusherServer({
  appId: PUSHER_APP_ID,
  key: PUSHER_KEY,
  secret: PUSHER_SECRET,
  cluster: 'ap1',
  useTLS: true,
})

export const pusherClient = new PusherClient(PUSHER_KEY,
  {
    cluster: 'ap1',
    forceTLS: true,
  }
)