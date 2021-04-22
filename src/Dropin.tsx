import React from 'react'
import { DropinProvider } from './Context'
import { DropinProps } from './types'

const Dropin: React.FC<DropinProps> = ({ children, ...props }) => {
  return <DropinProvider {...props}>{children}</DropinProvider>
}

export default Dropin
