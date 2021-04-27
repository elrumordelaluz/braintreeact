import { useState, useContext } from 'react'
import {
  Dropin,
  Field,
  PaypalButton,
  DropinContext,
  PaypalButtonStyles,
  FieldProps,
} from 'braintreeact'
import cn from 'classnames'
import DatGui, { DatBoolean, DatNumber, DatSelect } from 'react-dat-gui'

import './App.css'
import 'react-dat-gui/dist/index.css'

function App() {
  const [data, setState] = useState<PaypalButtonStyles & { width: number }>({
    shape: 'rect',
    color: 'black',
    size: 'responsive',
    width: 200,
    height: 55,
    label: 'paypal',
    layout: 'horizontal',
    tagline: false,
  })

  function handleUpdate(newData: any) {
    setState((s) => ({ ...s, ...newData }))
  }

  return (
    <div className="container">
      <DatGui data={data} onUpdate={handleUpdate}>
        <DatSelect path="shape" label="Shape" options={['rect', 'pill']} />
        <DatSelect
          path="color"
          label="Color"
          options={['gold', 'blue', 'silver', 'white', 'black']}
        />
        <DatSelect
          path="size"
          label="Size"
          options={['small', 'medium', 'large', 'responsive']}
        />
        <DatNumber path="width" label="Width" min={75} max={500} step={1} />
        <DatNumber path="height" label="Height" min={25} max={55} step={1} />
        <DatSelect
          path="label"
          label="Label"
          options={['checkout', 'pay', 'buynow', 'paypal']}
        />
        <DatSelect
          path="layout"
          label="Layout"
          options={['horizontal', 'vertical']}
        />
        {data.layout === 'horizontal' && (
          <DatBoolean path="tagline" label="Tagline" />
        )}
      </DatGui>

      <Dropin
        authorization={process.env.REACT_APP_AUTHORIZATION as string}
        styles={styles}
        paypalStyles={{
          shape: data.shape,
          color: data.color,
          size: data.size,
          height: data.height,
          label: data.label,
          layout: data.layout,
          tagline: data.tagline,
        }}
        withPaypal
      >
        <h1>Lorem Ipsum</h1>
        <CustomField type="number" placeholder="4111 1111 1111 1111" />
        <Field
          type="cvv"
          prefill="123"
          onFocus={() => console.log('cvv focused')}
        />
        <CustomButton width={data.width} />
        <Results />
      </Dropin>
    </div>
  )
}

function CustomButton({ width = 100 }) {
  const { paypalPayload } = useContext(DropinContext)
  return (
    <div style={{ width }}>
      {paypalPayload ? JSON.stringify(paypalPayload) : <PaypalButton />}
    </div>
  )
}

const CustomField: React.FC<FieldProps> = (props) => {
  const [focused, setFocused] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
  return (
    <div className="fieldContainer">
      <label>
        <span
          className={cn('label', {
            focused: focused || !isEmpty,
          })}
        >
          Card Number
        </span>

        <Field
          {...props}
          onFocus={() => setFocused(true)}
          onBlur={(fields) => {
            setFocused(false)
            setIsEmpty(fields.fields.number.isEmpty)
          }}
        />
      </label>
    </div>
  )
}

function Results() {
  const { paypalPayload, reset, paypalReady, getPayload } = useContext(
    DropinContext
  )
  return (
    <>
      {paypalReady ? null : 'loading paypal'}
      {paypalPayload ? JSON.stringify(paypalPayload) : null}
      <button onClick={reset}>reset</button>
      <button
        onClick={async () => {
          try {
            const { nonce } = await getPayload()
            alert(JSON.stringify({ nonce }))
          } catch (err) {
            console.log({ err })
          }
        }}
      >
        Pay
      </button>
    </>
  )
}

export default App

const styles = {
  input: {
    'font-size': '16px',
    'font-family': 'courier, monospace',
    'font-weight': 'lighter',
    color: '#ccc',
    padding: '1em 0',
  },
  label: {
    height: '30px',
  },
  ':focus': {
    color: 'black',
  },
  '.valid': {
    color: '#007aff',
  },
  '.invalid': {
    color: 'red',
  },
}
