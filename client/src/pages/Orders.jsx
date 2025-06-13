import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { CircularProgress } from "@mui/material";
import { getAllOrders, getProductDetails } from "../api";
import { formatDistanceStrict } from "date-fns";


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
const TimeAgo = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.textSecondary};
  align-self: flex-start;
  margin-top: 8px;
`;


const Section = styled.div`
  max-width: 1000px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 600;
  text-align: center;
`;

const OrderCard = styled.div`
  background: ${({ theme }) => theme.card};
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OrderInfo = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.textSecondary};
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text};
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  align-self: flex-end;
  padding: 6px 0;
`;

const ProductItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid #e0e0e0;
  margin-top: 10px;
  flex-wrap: wrap;
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const ProductTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
`;

const Image = styled.img`
  width: 160px;
  height: 120px;
  border-radius: 6px;
  object-fit: cover;
  transition: all 0.3s ease-out;

  @media (max-width: 900px) {
    width: 140px;
  }

  @media (max-width: 600px) {
    width: 120px;
    height: 100px;
  }

  @media (max-width: 400px) {
    width: 100px;
    height: 90px;
  }
`;

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
      console.log("Hello",orderData);
      const enrichedOrders = await Promise.all(
        orderData.map(async (order) => {
          const productsWithDetails = await Promise.all(
            order.products.map(async (p) => {
              try {
                const productRes = await getProductDetails(p.product);
                return {
                  ...productRes.data,
                  size: p.size,
                  quantity: p.quantity,
                };
              } catch (err) {
                console.error("Error fetching product:", err);
                return { name: "Unknown Product", quantity: p.quantity };
              }
            })
          );

          return {
            ...order,
            products: productsWithDetails,
          };
        })
      );
      console.log(enrichedOrders);
      setOrders(enrichedOrders);
    } catch (error) {
      console.error("Failed to load orders", error);
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
  return (
    <Container>
      <Section>
        <Title>Your Orders</Title>
        {loading ? (
          <CircularProgress />
        ) : orders.length === 0 ? (
          <div>No orders found.</div>
        ) : (
          orders.map((order) => (
            <OrderCard key={order._id}>
              <OrderInfo><strong>Order ID:</strong> {order._id}</OrderInfo>
              <OrderInfo><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</OrderInfo>
              <OrderInfo><strong>Address:</strong> {order.address}</OrderInfo>
              <OrderInfo><strong>Status:</strong> {order.status}</OrderInfo>
              <OrderInfo><strong>Total:</strong> ${parseFloat(order.total_amount.$numberDecimal).toFixed(2)}</OrderInfo>
              <TimeAgo>{formatDistanceStrict(new Date(order.createdAt), new Date(), { addSuffix: true })}</TimeAgo>
              <ToggleButton onClick={() => toggleExpand(order._id)}>
                {expandedOrderId === order._id ? "Hide Products  ▴" : "Show Products ▾"}
              </ToggleButton>

              {expandedOrderId === order._id && (
                <div>
                  {order.products.map((product, i) => (
                    <ProductItem key={i + 1}>
                      <ProductDetails>
                        <ProductTitle>{product.name}</ProductTitle>
                        <OrderInfo>Quantity: {product.quantity}</OrderInfo>
                        <OrderInfo>Size: {product.size}</OrderInfo>
                        <OrderInfo>Price: ${product.price.mrp}</OrderInfo>
                      </ProductDetails>
                      <Image src={product.img} alt={product.name} />
                    </ProductItem>
                  ))}
                </div>
              )}
            </OrderCard>
          ))
        )}
      </Section>
    </Container>
  );
};

export default Orders;
