import { gql } from '@apollo/client';

const PLAN_FIELDS = gql`
  fragment PlanFields on Plan {
    id
    code
    name
    tagline
    currency
    monthlyPrice
    quarterlyPrice
    sortOrder
    features {
      id
      kind
      title
      label
      included
      position
    }
  }
`;

export const GET_PLANS = gql`
  ${PLAN_FIELDS}
  query GetPlans {
    getPlans {
      ...PlanFields
    }
  }
`;

const SUBSCRIPTION_FIELDS = gql`
  ${PLAN_FIELDS}
  fragment SubscriptionFields on SellerSubscription {
    id
    interval
    amount
    currency
    status
    autoRenew
    provider
    currentPeriodStart
    currentPeriodEnd
    cancelledAt
    plan {
      ...PlanFields
    }
  }
`;

export const MY_SUBSCRIPTION = gql`
  ${SUBSCRIPTION_FIELDS}
  query MySubscription {
    mySubscription {
      ...SubscriptionFields
    }
  }
`;

/* checkoutUrl is null while no gateway is connected — the plan is live already.
   Once a bank is chosen it carries a hosted payment page to redirect to. */
export const SUBSCRIBE_TO_PLAN = gql`
  ${SUBSCRIPTION_FIELDS}
  mutation SubscribeToPlan($planCode: String!, $interval: BillingInterval!) {
    subscribeToPlan(planCode: $planCode, interval: $interval) {
      activated
      checkoutUrl
      subscription {
        ...SubscriptionFields
      }
    }
  }
`;

export const CANCEL_SUBSCRIPTION = gql`
  ${SUBSCRIPTION_FIELDS}
  mutation CancelSubscription {
    cancelSubscription {
      ...SubscriptionFields
    }
  }
`;
