import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  client as braintreeClient,
  hostedFields,
  paypalCheckout,
  HostedFieldFieldOptions,
  HostedFields,
  Client,
  PayPalCheckout,
  PayPalTokenizePayload,
} from 'braintree-web'

import {
  DropinProps,
  FieldOptions,
  HostedFieldsEvents,
  FieldEvents,
} from './types'

const defaultState = {
  addField: ({}) => {},
  getPayload: () => null,
  reset: () => null,
  paypalPayload: null,
  paypalReady: false,
}

interface ContextProps {
  addField: (options: FieldOptions) => void
  getPayload: () => any
  reset: () => void
  paypalPayload: PayPalTokenizePayload | null
  paypalReady: boolean
}

const DropinContext = React.createContext<ContextProps>(defaultState)

const DropinProvider: React.FC<DropinProps> = ({
  children,
  authorization,
  styles,
  withPaypal,
  paypalStyles,
}) => {
  const [fields, setFields] = useState<HostedFieldFieldOptions>({
    cvv: {},
    number: {},
  })
  const [events, setEvents] = useState<HostedFieldsEvents>({})
  const [client, setClient] = useState<Client | null>(null)
  const [
    paypalPayload,
    setPaypalPayload,
  ] = useState<PayPalTokenizePayload | null>(null)
  const [paypalReady, setPaypalReady] = useState<boolean>(false)

  const hostedFieldsInstance = useRef<HostedFields | null>(null)
  const paypalInstance = useRef<PayPalCheckout | null>(null)

  const initHostedFields = useCallback(
    function () {
      if (client) {
        hostedFields
          .create({
            client,
            styles,
            fields,
          })
          .then((instance) => {
            hostedFieldsInstance.current = instance
            function handler(e: any, kind: string) {
              if (events[e.emittedBy][kind]) {
                return events[e.emittedBy][kind](e)
              }
            }
            const onFocus = (e: any) => handler(e, 'onFocus')
            const onBlur = (e: any) => handler(e, 'onBlur')
            const onEmpty = (e: any) => handler(e, 'onEmpty')
            const onNonEmpty = (e: any) => handler(e, 'onNonEmpty')
            const onCardTypeChange = (e: any) => handler(e, 'onCardTypeChange')
            const onValidityChange = (e: any) => handler(e, 'onValidityChange')
            const onInputSubmitRequest = (e: any) =>
              handler(e, 'onInputSubmitRequest')

            hostedFieldsInstance.current?.on('focus', onFocus)
            hostedFieldsInstance.current?.on('blur', onBlur)
            hostedFieldsInstance.current?.on('empty', onEmpty)
            hostedFieldsInstance.current?.on('notEmpty', onNonEmpty)
            hostedFieldsInstance.current?.on('cardTypeChange', onCardTypeChange)
            hostedFieldsInstance.current?.on('validityChange', onValidityChange)
            hostedFieldsInstance.current?.on(
              'inputSubmitRequest',
              onInputSubmitRequest
            )
          })
      }
    },
    [client, styles, fields]
  )

  const initPaypal = useCallback(
    async function () {
      try {
        if (client && withPaypal) {
          paypalInstance.current = await paypalCheckout.create({
            client,
          })
          await paypalInstance.current.loadPayPalSDK({
            // vault: true,
            // // intent: 'tokenize',
          })

          // @ts-ignore
          const btn = await paypal.Buttons({
            style: paypalStyles,
            // // @ts-ignore
            // fundingSource: paypal.FUNDING.PAYPAL,
            // createBillingAgreement: function () {
            //   return paypalInstance.current?.createPayment({
            //     // @ts-ignore
            //     flow: 'vault',
            //     // @ts-ignore
            //     intent: 'tokenize',
            //   })
            // },

            onApprove: function (data: any) {
              return paypalInstance.current?.tokenizePayment(
                data,
                function (err, payload) {
                  if (!err) setPaypalPayload(payload)
                }
              )
            },

            onCancel: function (data: any) {
              console.log(
                'PayPal payment cancelled',
                JSON.stringify(data, null, 2)
              )
            },

            onError: function (err: any) {
              console.error('PayPal error', err)
            },
          })

          await btn.render('#braintreeact-paypal-button')
          setPaypalReady(true)
        }
      } catch (err) {
        console.error('PayPal mounting error', err)
      }
    },
    [client, withPaypal, paypalStyles]
  )

  useEffect(() => {
    if (!client) {
      braintreeClient.create({ authorization }).then(setClient)
    }
  }, [])

  useEffect(() => {
    if (!hostedFieldsInstance.current) {
      initHostedFields()
    }

    return () => {
      if (hostedFieldsInstance.current) {
        hostedFieldsInstance.current.teardown()
        hostedFieldsInstance.current = null
      }
    }
  }, [initHostedFields])

  useEffect(() => {
    initPaypal()

    return () => {
      paypalInstance.current?.teardown()
      paypalInstance.current = null
    }
  }, [initPaypal])

  function addField(options: FieldOptions & FieldEvents) {
    const {
      type,
      onBlur,
      onFocus,
      onEmpty,
      onNonEmpty,
      onCardTypeChange,
      onValidityChange,
      onInputSubmitRequest,
      ...attrs
    } = options

    setFields((fields) => ({
      ...fields,
      [type]: attrs,
    }))

    setEvents((events) => ({
      ...events,
      [type]: {
        onBlur,
        onFocus,
        onEmpty,
        onNonEmpty,
        onCardTypeChange,
        onValidityChange,
        onInputSubmitRequest,
      },
    }))
  }

  async function getPayload() {
    try {
      if (paypalPayload) {
        return paypalPayload
      } else {
        const { fields } = hostedFieldsInstance.current?.getState()
        const invalidFields = Object.keys(fields).filter(
          (field) => !fields[field].isValid
        )
        if (invalidFields.length === 0) {
          return await hostedFieldsInstance.current?.tokenize()
        } else {
          return Promise.reject(invalidFields)
        }
      }
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async function reset() {
    hostedFieldsInstance.current?.teardown()
    await paypalInstance.current?.teardown()
    setPaypalPayload(null)
    hostedFieldsInstance.current = null
    paypalInstance.current = null

    initHostedFields()
    initPaypal()
  }

  let value = { addField, paypalPayload, getPayload, reset, paypalReady }

  return (
    <DropinContext.Provider value={value}>{children}</DropinContext.Provider>
  )
}

export default DropinContext

export { DropinProvider }
