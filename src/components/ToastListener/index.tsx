import React from 'react'
import { ToastContainer } from 'maki-toolkit-v3'
import useToast from 'hooks/useToast'
// eslint-disable-next-line
const ToastListener = () => {
  const { toasts, remove } = useToast()

  const handleRemove = (id: string) => remove(id)

  return <ToastContainer toasts={toasts} onRemove={handleRemove} />
}

export default ToastListener
