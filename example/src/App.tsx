import { useState, useContext } from 'react'
import {
  Dropin,
  Field,
  PaypalButton,
  DropinContext,
  PaypalButtonStyles,
} from 'braintreeact'
import cn from 'classnames'
import DatGui, { DatBoolean, DatNumber, DatSelect } from 'react-dat-gui'

import './App.css'
import 'react-dat-gui/dist/index.css'

function App() {
  const [data, setState] = useState<PaypalButtonStyles>({
    shape: 'rect',
    color: 'black',
    size: 'responsive',
    height: 55,
    label: 'paypal',
    layout: 'horizontal',
    tagline: false,
    fundingicons: false,
  })

  function handleUpdate(newData: any) {
    setState((s) => ({ ...s, ...newData }))
  }

  const [focused, setFocused] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)

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
        <DatBoolean path="tagline" label="Tagline" />
        <DatBoolean path="fundingicons" label="Funding Icons" />
      </DatGui>

      <Dropin
        authorization={process.env.REACT_APP_AUTHORIZATION as string}
        styles={styles}
        paypalClientId={process.env.REACT_APP_PAYPAL_CLIENT_ID}
        paypalStyles={{
          shape: data.shape,
          color: data.color,
          size: data.size,
          height: data.height,
          label: data.label,
          layout: data.layout,
          tagline: data.tagline,
          fundingicons: data.fundingicons,
        }}
      >
        <h1>Lorem Ipsum</h1>
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
              type="number"
              placeholder="4111111111111111"
              onFocus={() => setFocused(true)}
              onBlur={(fields) => {
                setFocused(false)
                setIsEmpty(fields.fields.number.isEmpty)
              }}
            />
          </label>
        </div>
        <Field type="cvv" prefill="123" />
        <PaypalButton />
        <Results />
      </Dropin>
    </div>
  )
}

function Results() {
  const { paypalPayload, reset, getPayload, paypalReady } = useContext(
    DropinContext
  )
  return (
    <>
      {paypalReady ? null : 'loading paypal'}
      {paypalPayload ? JSON.stringify(paypalPayload) : null}
      <button onClick={reset}>reset</button>
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
