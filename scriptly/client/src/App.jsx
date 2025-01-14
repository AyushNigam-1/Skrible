import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { decrement, increment } from './state/slice'
import { useQuery } from '@apollo/client'
export default function App() {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()

  

  return (
    <>

    </>
  )
}