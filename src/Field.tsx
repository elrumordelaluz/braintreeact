import React, { useContext, useEffect, useRef } from 'react'
import DropinConsumer from './Context'
import { FieldOptions, FieldEvents } from './types'

const Field: React.FC<FieldOptions & FieldEvents> = ({
  children,
  ...props
}) => {
  let ref = useRef() as React.MutableRefObject<HTMLInputElement>
  const { addField } = useContext(DropinConsumer)

  useEffect(() => {
    addField({
      container: ref.current,
      ...props,
    })
  }, [])

  return (
    <>
      {children && typeof children === 'function' ? children('hola') : null}
      <div ref={ref} />
    </>
  )
}

export default Field
