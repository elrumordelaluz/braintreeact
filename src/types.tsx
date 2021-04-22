import braintree from 'braintree-web'

export type DropinProps = {
  authorization: string
  env?: 'sandbox' | 'production'
  children?: React.ReactNode
  styles?: object
  paypalClientId?: string
  paypalStyles?: PaypalButtonStyles
}

export type ButtonProps = { style: any }

export type HostedFieldsHostedFieldsFieldName =
  | 'number'
  | 'cvv'
  | 'expirationDate'
  | 'expirationMonth'
  | 'expirationYear'
  | 'postalCode'
  | 'cardholderName'

export type HostedFieldsEvents = {
  [key in HostedFieldsHostedFieldsFieldName]?: FieldEvents
}

export type FieldOptions = {
  container?: string | HTMLElement
  placeholder?: string
  type: string
  internalLabel?: string
  formatInput?: boolean
  maskInput?: object | boolean
  select?: object | boolean
  maxCardLength?: number
  maxlength?: number
  prefill?: string
  rejectUnsupportedCards?: boolean
  supportedCardBrands?: object
}

export type FieldEvents = {
  onBlur?: (event: braintree.HostedFieldsStateObject) => void
  onFocus?: (event: braintree.HostedFieldsStateObject) => void
  onEmpty?: (event: braintree.HostedFieldsStateObject) => void
  onNonEmpty?: (event: braintree.HostedFieldsStateObject) => void
  onCardTypeChange?: (event: braintree.HostedFieldsStateObject) => void
  onValidityChange?: (event: braintree.HostedFieldsStateObject) => void
  onInputSubmitRequest?: (event: braintree.HostedFieldsStateObject) => void
}

export type PaypalButtonStyles = {
  shape?: 'pill' | 'rect'
  color?: 'gold' | 'blue' | 'silver' | 'white' | 'black'
  size?: 'small' | 'medium' | 'large' | 'responsive'
  height?: number
  label?: 'checkout' | 'pay' | 'buynow' | 'paypal'
  tagline?: boolean
  layout?: 'vertical' | 'horizontal'
  fundingicons?: boolean
}