import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components"; // Import keyframes for animations
import { CircularProgress } from "@mui/material";
import { getAllOrders, getProductDetails } from "../api";
import { formatDistanceStrict } from "date-fns"; // For time ago display

// --- Styled Components ---

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  padding: 20px 30px 200px;
  height: 100%;
  overflow-y: scroll;
  display: flex;
  align-items: center;
  flex-direction: column;
  background: ${({ theme }) => theme.bg};
  @media (max-width: 768px) {
    padding: 20px 12px;
  }
`;

const Section = styled.div`
  max-width: 1000px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const Title = styled.h2`
  font-size: 32px; /* Slightly larger title */
  font-weight: 700; /* Bolder title */
  text-align: center;
  color: ${({ theme }) => theme.text}; /* Ensure title color is consistent */
  margin-bottom: 20px;
`;

const OrderCard = styled.div`
  background: ${({ theme }) => theme.card};
  padding: 25px; /* Increased padding for more breathing room */
  border-radius: 16px; /* Slightly more rounded corners */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* More prominent shadow */
  display: flex;
  flex-direction: column;
  gap: 15px; /* Increased gap */
  transition: all 0.3s ease-in-out; /* Smooth transition for hover effects */
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12); /* Enhanced shadow on hover */
    transform: translateY(-2px); /* Slight lift on hover */
  }
`;

const OrderSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); /* Responsive grid for order info */
  gap: 10px 20px; /* Gap between grid items */
  font-size: 15px;
  color: ${({ theme }) => theme.text_secondary};
  strong {
    color: ${({ theme }) => theme.text}; /* Make strong text more prominent */
  }
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  span {
    font-weight: 500;
    color: ${({ theme }) => theme.text};
  }
`;

const TimeAgo = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text_secondary};
  align-self: flex-start; /* Align to start in flex column */
  margin-top: 5px;
`;

const ToggleButton = styled.button`
  background: ${({ theme }) => theme.primary + "15"}; /* Light background from theme */
  border: none;
  color: ${({ theme }) => theme.primary}; /* Primary color for text */
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  align-self: flex-end;
  padding: 8px 15px; /* More padding */
  border-radius: 8px; /* Rounded button */
  transition: all 0.3s ease-in-out;
  &:hover {
    background: ${({ theme }) => theme.primary + "30"}; /* Darker on hover */
  }
  &:active {
    transform: translateY(1px); /* Click effect */
  }
`;

const ProductList = styled.div`
  animation: ${fadeIn} 0.5s ease-out; /* Fade-in animation for product list */
  border-top: 1px solid ${({ theme }) => theme.text_secondary + "20"}; /* Lighter separator */
  padding-top: 15px;
  margin-top: 10px;
`;

const ProductItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center; /* Center align items */
  gap: 20px; /* Increased gap */
  padding: 15px 0;
  border-bottom: 1px solid ${({ theme }) => theme.text_secondary + "10"}; /* Subtle separator */
  &:last-child {
    border-bottom: none; /* No border for the last item */
  }
  @media (max-width: 600px) {
    flex-direction: column; /* Stack on smaller screens */
    align-items: flex-start;
  }
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px; /* Increased gap */
  flex: 1;
`;

const ProductTitle = styled.div`
  font-size: 18px; /* Slightly larger product title */
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const ProductInfo = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text_secondary};
`;

const Image = styled.img`
  min-width: 120px; /* Ensure minimum width for image */
  height: 90px;
  border-radius: 8px; /* More rounded image corners */
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* Slight shadow for images */
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: scale(1.02); /* Slight zoom on hover */
  }

  @media (max-width: 900px) {
    min-width: 100px;
    height: 80px;
  }
  @media (max-width: 600px) {
    min-width: 100%; /* Full width on small screens */
    height: 150px;
  }
`;

const EmptyOrders = styled.div`
  font-size: 18px;
  color: ${({ theme }) => theme.text_secondary};
  text-align: center;
  margin-top: 50px;
`;

// --- Orders Component ---

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem("sibi-app-token");

    try {
      const res = await getAllOrders(token);
      const orderData = res.data;

      const enrichedOrders = await Promise.all(
        orderData.map(async (order) => {
          const productsWithDetails = await Promise.all(
            order.products.map(async (p) => {
              try {
                const productRes = await getProductDetails(p.product);
                // Ensure default values if product details are missing
                return {
                  ...productRes.data,
                  name: productRes.data?.name || "Unknown Product",
                  img: productRes.data?.img || "placeholder_image_url", // Add a placeholder
                  price: productRes.data?.price || { mrp: "N/A" },
                  size: p.size,
                  quantity: p.quantity,
                };
              } catch (err) {
                console.error(`Error fetching product ${p.product}:`, err);
                return {
                  _id: p.product, // Keep the ID for unique key if product details fail
                  name: "Product Not Available", // Fallback name
                  img: "placeholder_image_url", // Use a placeholder for missing images
                  price: { mrp: "N/A" },
                  size: p.size,
                  quantity: p.quantity,
                };
              }
            })
          );

          return {
            ...order,
            products: productsWithDetails,
          };
        })
      );
      setOrders(enrichedOrders);
    } catch (error) {
      console.error("Failed to load orders", error);
      // You might want to dispatch a snackbar here as well
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId((prevId) => (prevId === orderId ? null : orderId));
  };

  useEffect(() => {
    fetchOrders();
  }, []);
// console.table(orders[0].total_amount);
  return (
    <Container>
      <Section>
        <Title>Your Orders</Title>
        {loading ? (
          <CircularProgress color="inherit" /> /* Use inherit to pick up theme color */
        ) : orders.length === 0 ? (
          <EmptyOrders>You haven't placed any orders yet.</EmptyOrders>
        ) : (
          orders.map((order) => (
            <OrderCard key={order._id}>
              <OrderSummary>
                <OrderInfo>
                  <strong>Order ID:</strong> <span>{order._id}</span>
                </OrderInfo>
                <OrderInfo>
                  <strong>Date:</strong>{" "}
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </OrderInfo>
                <OrderInfo>
                  <strong>Total:</strong>{" "}
                  <span>
                    ${parseFloat(order.total_amount.$numberDecimal).toFixed(2)}
                  </span>
                </OrderInfo>
                <OrderInfo>
                  <strong>Status:</strong> <span>{order.status}</span>
                </OrderInfo>
              </OrderSummary>

              {/* Display address below summary as it can be long */}
              <OrderInfo style={{ fontSize: "14px" }}>
                <strong>Delivery Address:</strong>{" "}
                <span>{order.address}</span>
              </OrderInfo>

              <TimeAgo>
                Ordered {formatDistanceStrict(new Date(order.createdAt), new Date(), { addSuffix: true })}
              </TimeAgo>

              <ToggleButton onClick={() => toggleExpand(order._id)}>
                {expandedOrderId === order._id ? "Hide Products  ⛌" : "Show Products ▾"}
              </ToggleButton>

              {expandedOrderId === order._id && (
                <ProductList>
                  {order.products.map((product) => (
                    <ProductItem key={product._id}>
                      <ProductDetails>
                        <ProductTitle>{product.name}</ProductTitle>
                        <ProductInfo>Quantity: {product.quantity}</ProductInfo>
                        <ProductInfo>Size: {product.size}</ProductInfo>
                        <ProductInfo>Price: ${product.price.mrp}</ProductInfo>
                      </ProductDetails>
                      <Image src={product.img} alt={product.name} />
                    </ProductItem>
                  ))}
                </ProductList>
              )}
            </OrderCard>
          ))
        )}
      </Section>
    </Container>
  );
};

export default Orders;