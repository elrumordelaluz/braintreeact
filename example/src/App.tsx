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
        <h1>Braintreeact</h1>
        <CustomField type="number" />
        <label>
          CVV:
          <Field
            type="cvv"
            placeholder="123"
            onFocus={() => console.log('cvv focused')}
            className="simpleField"
          />
        </label>
        <hr />
        <Field
          type="expirationMonth"
          placeholder="11"
          onFocus={() => console.log('expiration year focused')}
          className="yearField"
        />{' '}
        /
        <Field
          type="expirationYear"
          placeholder="21"
          onFocus={() => console.log('expiration year focused')}
          className="yearField"
        />
        <hr />
        {/*<Field
          type="expirationDate"
          placeholder="11/21"
          onFocus={() => console.log('expiration year focused')}
          className="simpleField"
        />{' '} */}
        <PaypalButtonWithInfo width={data.width} />
        <Results />
      </Dropin>
    </div>
  )
}

function PaypalButtonWithInfo({ width = 100 }) {
  const { paypalReady, paypalPayload, reset } = useContext(DropinContext)
  return (
    <div
      style={{
        width: paypalPayload ? '100%' : width,
        marginBottom: 50,
        opacity: paypalReady ? 1 : 0.5,
        pointerEvents: paypalReady ? 'auto' : 'none',
        marginTop: '1em',
      }}
    >
      {paypalPayload ? (
        <div className="paypalMethod">
          <img
            src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png"
            alt="PayPal Logo"
          />
          {paypalPayload.details.email}
          <button onClick={reset} className="paypalMethodReset">
            Reset
          </button>
        </div>
      ) : (
        <PaypalButton />
      )}
    </div>
  )
}

const CustomField: React.FC<FieldProps> = (props) => {
  const [focused, setFocused] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
  return (
    <label className="fieldContainer">
      <div
        className={cn('label', {
          focused: focused || !isEmpty,
        })}
      >
        Card Number
      </div>
      <Field
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={(fields) => {
          setFocused(false)
          setIsEmpty(fields.fields.number.isEmpty)
        }}
        className="field"
      />
    </label>
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
    'font-size': '18px',
    'font-family': 'Avenir',
    'font-weight': '400',
    color: '#6e6e6f',
  },
  label: {
    height: '30px',
  },
  ':focus': {
    color: '#6e6e6f',
  },
  '.valid': {
    color: '#09090f',
  },
  '.invalid': {
    color: '#ff3b57',
  },
}
