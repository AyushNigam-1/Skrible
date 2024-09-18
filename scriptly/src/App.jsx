import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { decrement, increment } from './state/slice'

export default function App() {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()

  return (
    <div>
      <p className='text-red-500' > Lol </p>
    </div>
  )
}