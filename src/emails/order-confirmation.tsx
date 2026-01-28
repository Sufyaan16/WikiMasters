import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface OrderConfirmationEmailProps {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
}

export const OrderConfirmationEmail = ({
  customerName = "Customer",
  orderNumber = "ORD-2024-000001",
  orderDate = new Date().toLocaleDateString(),
  items = [],
  subtotal = 0,
  tax = 0,
  shippingCost = 0,
  total = 0,
  shippingAddress = "",
  shippingCity = "",
  shippingState = "",
  shippingZip = "",
}: OrderConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your order {orderNumber} has been confirmed! 🎉</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Order Confirmation</Heading>
            <Text style={headerText}>Thank you for your order! 🎉</Text>
          </Section>

          {/* Order Details */}
          <Section style={section}>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              We're excited to let you know that we've received your order and it's being processed.
            </Text>
          </Section>

          {/* Order Info */}
          <Section style={orderInfoSection}>
            <Text style={orderInfoText}>
              <strong>Order Number:</strong> {orderNumber}
            </Text>
            <Text style={orderInfoText}>
              <strong>Order Date:</strong> {orderDate}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Items */}
          <Section style={section}>
            <Heading as="h2" style={h2}>
              Order Items
            </Heading>
            {items.map((item, index) => (
              <Section key={index} style={itemSection}>
                <table style={itemTable}>
                  <tr>
                    <td style={itemImageCell}>
                      <Img
                        src={item.productImage}
                        alt={item.productName}
                        width="80"
                        height="80"
                        style={itemImage}
                      />
                    </td>
                    <td style={itemDetailsCell}>
                      <Text style={itemName}>{item.productName}</Text>
                      <Text style={itemDetail}>Quantity: {item.quantity}</Text>
                      <Text style={itemDetail}>Price: ${item.price.toFixed(2)}</Text>
                    </td>
                    <td style={itemTotalCell}>
                      <Text style={itemTotal}>${item.total.toFixed(2)}</Text>
                    </td>
                  </tr>
                </table>
              </Section>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Order Summary */}
          <Section style={section}>
            <Heading as="h2" style={h2}>
              Order Summary
            </Heading>
            <table style={summaryTable}>
              <tr>
                <td style={summaryLabel}>Subtotal:</td>
                <td style={summaryValue}>${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style={summaryLabel}>Tax:</td>
                <td style={summaryValue}>${tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td style={summaryLabel}>Shipping:</td>
                <td style={summaryValue}>${shippingCost.toFixed(2)}</td>
              </tr>
              <tr style={totalRow}>
                <td style={summaryLabelBold}>Total:</td>
                <td style={summaryValueBold}>${total.toFixed(2)}</td>
              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          {/* Shipping Address */}
          <Section style={section}>
            <Heading as="h2" style={h2}>
              Shipping Address
            </Heading>
            <Text style={addressText}>{shippingAddress}</Text>
            <Text style={addressText}>
              {shippingCity}, {shippingState} {shippingZip}
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              If you have any questions about your order, please contact our support team.
            </Text>
            <Text style={footerText}>Thank you for shopping with us!</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 24px",
  backgroundColor: "#000000",
  textAlign: "center" as const,
};

const h1 = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0 0 8px",
  padding: "0",
};

const headerText = {
  color: "#ffffff",
  fontSize: "16px",
  margin: "0",
};

const section = {
  padding: "24px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
};

const orderInfoSection = {
  padding: "16px 24px",
  backgroundColor: "#f4f4f5",
};

const orderInfoText = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "4px 0",
};

const h2 = {
  color: "#000",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const hr = {
  borderColor: "#e6e6e6",
  margin: "20px 0",
};

const itemSection = {
  marginBottom: "16px",
};

const itemTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const itemImageCell = {
  width: "80px",
  verticalAlign: "top" as const,
  paddingRight: "16px",
};

const itemImage = {
  borderRadius: "8px",
  objectFit: "cover" as const,
};

const itemDetailsCell = {
  verticalAlign: "top" as const,
};

const itemName = {
  color: "#000",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const itemDetail = {
  color: "#666",
  fontSize: "14px",
  margin: "4px 0",
};

const itemTotalCell = {
  verticalAlign: "top" as const,
  textAlign: "right" as const,
  width: "100px",
};

const itemTotal = {
  color: "#000",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
};

const summaryTable = {
  width: "100%",
  fontSize: "14px",
};

const summaryLabel = {
  color: "#666",
  padding: "8px 0",
  textAlign: "left" as const,
};

const summaryValue = {
  color: "#333",
  padding: "8px 0",
  textAlign: "right" as const,
};

const summaryLabelBold = {
  color: "#000",
  padding: "12px 0 0",
  textAlign: "left" as const,
  fontSize: "16px",
  fontWeight: "bold",
  borderTop: "2px solid #e6e6e6",
};

const summaryValueBold = {
  color: "#000",
  padding: "12px 0 0",
  textAlign: "right" as const,
  fontSize: "18px",
  fontWeight: "bold",
  borderTop: "2px solid #e6e6e6",
};

const totalRow = {
  borderTop: "2px solid #e6e6e6",
};

const addressText = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "4px 0",
};

const footer = {
  padding: "24px",
  textAlign: "center" as const,
  backgroundColor: "#f9fafb",
};

const footerText = {
  color: "#666",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "8px 0",
};
