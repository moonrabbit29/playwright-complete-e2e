import {InferFromSchema} from '@api/helper/schema-validator'

export const CounterpartySchema = {
  type: 'object',
  properties: {
    id:            { type: 'string' },
    name:          { type: 'string' },
    city:          { type: 'string' },
    country:       { type: 'string' },
    currency:      { type: 'string' },
    accountNumber: { type: 'string' },
    swiftCode:     { type: 'string' },
    contactPerson: { type: 'string' },
    phone:         { type: 'string' },
    email:         { type: 'string', format: 'email' }
  },
  required: ['id','name','city','country','currency','accountNumber','swiftCode','contactPerson','phone','email'],
  additionalProperties: false,
} as const;

export const CounterpartyListSchema = {
  type: 'array',
  items: CounterpartySchema,
} as const;


export type Counterparty = InferFromSchema<typeof CounterpartySchema>;
export type CounterpartyList = InferFromSchema<typeof CounterpartyListSchema>;