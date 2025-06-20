import React, { useEffect, useState } from "react";
import styled from "styled-components";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import { addToCart, deleteFromCart, getCart, placeOrder } from "../api";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { useDispatch } from "react-redux";
import { openSnackbar } from "../redux/reducers/snackbarSlice";
import { DeleteOutline } from "@mui/icons-material";
import { Toaster } from "../components/Toaster";

// Styled Components

const Container = styled.div`
  padding: 20px 30px;
  padding-bottom: 200px;
  height: 100%;
  overflow-y: scroll;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 30px;
  background: ${({ theme }) => theme.bg};
  @media (max-width: 768px) {
    padding: 20px 12px;
  }
`;

const Section = styled.div`
  width: 100%;
  max-width: 1400px;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 22px;
  gap: 28px;
`;

const Title = styled.div`
  font-size: 28px;
  font-weight: 500;
  display: flex;
  justify-content: ${({ center }) => (center ? "center" : "space-between")};
  align-items: center;

  @media (max-width: 630px) {
    font-size: 22px;
  }
`;

const Wrapper = styled.div`
  display: flex;
  gap: 32px;
  width: 100%;
  padding: 12px;
  @media (max-width: 750px) {
    flex-direction: column;
  }
  @media (max-width: 630px) {
    gap: 16px;
    padding: 8px;
  }
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  @media (max-width: 750px) {
    flex: 1.2;
  }
`;

const Table = styled.div`
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 30px;
  position: relative;

  ${({ head }) => head && `margin-bottom: 22px;`}
  
  @media (max-width: 630px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    border: 1px solid ${({ theme }) => theme.text_secondary + 40};
    padding: 16px;
    border-radius: 12px;
    width: 95%;
    position: relative;
    background: ${({ theme }) => theme.bg_secondary || "#fff"};
  }
`;

const TableH = styled.div`
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 30px;
  ${({ head }) => head && `margin-bottom: 22px;`}
  @media (max-width: 630px) {
  display:none;
    flex-direction: row;
    align-items: flex-start;
    gap: 10px;
    border: 1px solid ${({ theme }) => theme.text_secondary + 40};
    padding: 12px;
    border-radius: 8px;
    width: 100%;
  }
`;

const TableItem = styled.div`
  ${({ flex }) => flex && `flex: 1;`}
  ${({ bold }) => bold && `font-weight: 600; font-size: 18px;`}
  @media (max-width: 630px) {
    // width: 100%;
    font-size: 14px;
  }
`;
const TableItemP = styled.div`
  ${({ flex }) => flex && `flex: 1;`}
  ${({ bold }) => bold && `font-weight: 600; font-size: 18px;`}
  @media (max-width: 630px) {
    display:none;
    font-size: 14px;
  }
`;
const DTableItem = styled.div`
  ${({ flex }) => flex && `flex: 1;`}
  ${({ bold }) => bold && `font-weight: 600; font-size: 18px;`}

  @media (max-width: 630px) {
    position: absolute;
    top: 8px;
    right: 8px;
    display: block;
    cursor: pointer;
  }
`;

const Counter = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.text_secondary + 40};
  border-radius: 8px;
  padding: 4px 12px;
`;

const Product = styled.div`
  display: flex;
  gap: 16px;
  @media (max-width: 630px) {
    flex-direction: row;
  }
`;

const Img = styled.img`
  height: 80px;
  @media (max-width: 630px) {
    height: 60px;
  }
`;

const Details = styled.div``;

const Protitle = styled.div`
  color: ${({ theme }) => theme.primary};
  font-size: 16px;
  font-weight: 500;
`;

const ProDesc = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.text_primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProSize = styled.div`
  font-size: 14px;
  font-weight: 500;
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  @media (max-width: 750px) {
    flex: 0.8;
  }
`;

const Subtotal = styled.div`
  font-size: 22px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;

  @media (max-width: 630px) {
    font-size: 18px;
  }
`;

const Delivery = styled.div`
  font-size: 18px;
  font-weight: 500;
  display: flex;
  gap: 6px;
  flex-direction: column;
`;

// Main Component

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [products, setProducts] = useState([]);
  const [buttonLoad, setButtonLoad] = useState(false);

  const [deliveryDetails, setDeliveryDetails] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    phoneNumber: "",
    completeAddress: "",
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: "",
  });

  const getProducts = async () => {
    setLoading(true);
    const token = localStorage.getItem("sibi-app-token");
    await getCart(token).then((res) => {
      setProducts(res.data);
      setLoading(false);
    });
  };

const addCart = async (id) => {
  const token = localStorage.getItem("sibi-app-token");
  const currentItem = products.find((item) => item.product._id === id);

  if (currentItem?.quantity >= 10) {
    dispatch(openSnackbar({ message: "Maximum quantity is 10", severity: "warning" }));
    return;
  }

  await addToCart(token, { productId: id, quantity: 1 })
    .then(() => setReload(!reload))
    .catch((err) => {
      setReload(!reload);
      dispatch(openSnackbar({ message: err.message, severity: "error" }));
    });
};


  const removeCart = async (id, quantity, type) => {
    const token = localStorage.getItem("sibi-app-token");
    let qnt = quantity > 0 ? 1 : null;
    if (type === "full") qnt = null;
    await deleteFromCart(token, { productId: id, quantity: qnt })
      .then(() => setReload(!reload))
      .catch((err) => {
        setReload(!reload);
        dispatch(openSnackbar({ message: err.message, severity: "error" }));
      });
  };

  const calculateSubtotal = () => {
    return products.reduce(
      (total, item) => total + item.quantity * item?.product?.price?.org,
      0
    );
  };

  useEffect(() => {
    getProducts();
  }, [reload]);

  const convertAddressToString = (addressObj) => {
    return `${addressObj.firstName} ${addressObj.lastName}, ${addressObj.completeAddress}, ${addressObj.phoneNumber}, ${addressObj.emailAddress}`;
  };

  const PlaceOrder = async () => {
    setButtonLoad(true);
    try {
      const isDeliveryDetailsFilled =
        deliveryDetails.firstName &&
        deliveryDetails.lastName &&
        deliveryDetails.completeAddress &&
        deliveryDetails.phoneNumber &&
        deliveryDetails.emailAddress;

      if (!isDeliveryDetailsFilled) {
        Toaster("error", "Please fill in all required delivery details");
        dispatch(
          openSnackbar({
            message: "Please fill in all required delivery details.",
            severity: "error",
          })
        );
        setButtonLoad(false);
        return;
      }

      const token = localStorage.getItem("sibi-app-token");
      const totalAmount = calculateSubtotal().toFixed(2);
      const orderDetails = {
        products,
        address: convertAddressToString(deliveryDetails),
        totalAmount,
      };

      const res = await placeOrder(token, orderDetails);
      Toaster("success", res.data.message);
      dispatch(
        openSnackbar({
          message: "Order placed successfully",
          severity: "success",
        })
      );
      setButtonLoad(false);
      setReload(!reload);
    } catch (error) {
      dispatch(
        openSnackbar({
          message: "Failed to place order. Please try again.",
          severity: "error",
        })
      );
      setButtonLoad(false);
    }
  };

  return (
    <Container>
      {loading ? (
        <CircularProgress />
      ) : (
        <Section>
          <Title>Your Shopping Cart</Title>
          {products.length === 0 ? (
            <>Cart is empty</>
          ) : (
            <Wrapper>
              <Left>
                <TableH head>
                  <TableItem bold flex>Product</TableItem>
                  <TableItem bold>Price</TableItem>
                  <TableItem bold>Quantity</TableItem>
                  <TableItem bold>Subtotal</TableItem>
                  <TableItem></TableItem>
                </TableH>
                {products.map((item) => (
                  <Table key={item?.product?._id}>
                    <TableItem flex>
                      <Product>
                        <Img src={item?.product?.img} />
                        <Details>
                          <Protitle>{item?.product?.title}</Protitle>
                          <ProDesc>{item?.product?.name}</ProDesc>
                          <ProSize>Size : {item?.size}</ProSize>
                        </Details>
                      </Product>
                    </TableItem>
                    <TableItem>${item?.product?.price?.org}</TableItem>
                    <TableItem>
                      <Counter>
                        <div
                          style={{ cursor: "pointer", flex: 1 }}
                          onClick={() =>
                            removeCart(item?.product?._id, item?.quantity - 1)
                          }
                        >
                          -
                        </div>
                        {item?.quantity}
                        <div
  style={{
    cursor: item.quantity >= 10 ? "not-allowed" : "pointer",
    flex: 1,
    opacity: item.quantity >= 10 ? 0.4 : 1,
  }}
  onClick={() => {
    if (item.quantity < 10) addCart(item?.product?._id);
  }}
>
  +
</div>

                      </Counter>
                    </TableItem>
                    <TableItemP>
                      ${(item.quantity * item?.product?.price?.org).toFixed(2)}
                    </TableItemP>
                    <DTableItem>
                      <DeleteOutline
                        sx={{ color: "red"}}
                        onClick={() =>
                          removeCart(
                            item?.product?._id,
                            item?.quantity - 1,
                            "full"
                          )
                        }
                      />
                    </DTableItem>
                  </Table>
                ))}
              </Left>
              <Right>
                <Subtotal>Subtotal: ${calculateSubtotal().toFixed(2)}</Subtotal>
                <Delivery>
                  Delivery Details:
                  <div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <TextInput
                        small
                        placeholder="First Name"
                        value={deliveryDetails.firstName}
                        handelChange={(e) =>
                          setDeliveryDetails({
                            ...deliveryDetails,
                            firstName: e.target.value,
                          })
                        }
                      />
                      <TextInput
                        small
                        placeholder="Last Name"
                        value={deliveryDetails.lastName}
                        handelChange={(e) =>
                          setDeliveryDetails({
                            ...deliveryDetails,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <TextInput
                      small
                      value={deliveryDetails.emailAddress}
                      handelChange={(e) =>
                        setDeliveryDetails({
                          ...deliveryDetails,
                          emailAddress: e.target.value,
                        })
                      }
                      placeholder="Email Address"
                    />
                    <TextInput
                      small
                      type="number"
                      value={deliveryDetails.phoneNumber}
                      handelChange={(e) =>
                        setDeliveryDetails({
                          ...deliveryDetails,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="Phone no. +91 XXXXX XXXXX"
                    />
                    <TextInput
                      small
                      textArea
                      rows="5"
                      value={deliveryDetails.completeAddress}
                      handelChange={(e) =>
                        setDeliveryDetails({
                          ...deliveryDetails,
                          completeAddress: e.target.value,
                        })
                      }
                      placeholder="Complete Address"
                    />
                  </div>
                </Delivery>
                <Delivery>
                  Payment Details:
                  <div>
                    <TextInput
                      small
                      type="number"
                      placeholder="Card Number"
                      value={paymentDetails.cardNumber}
                      handelChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          cardNumber: e.target.value,
                        })
                      }
                    />
                    <div style={{ display: "flex", gap: "6px",alignItems:"center" }}>
                      <p style={{ fontSize:"13px",display: "flex", gap: "6px",alignItems:"center" }}>Expiry Date : </p>
                      <TextInput
                        small
                        placeholder="Expiry Date"
                        type="date"
                        value={paymentDetails.expiryDate}
                        handelChange={(e) =>
                          setPaymentDetails({
                            ...paymentDetails,
                            expiryDate: e.target.value,
                          })
                        }
                      />
                      <TextInput
                        small
                        type="number"
                        placeholder="CVV"
                        value={paymentDetails.cvv}
                        handelChange={(e) =>
                          setPaymentDetails({
                            ...paymentDetails,
                            cvv: e.target.value,
                          })
                        }
                      />
                    </div>
                    <TextInput
                      small
                      placeholder="Card Holder name"
                      value={paymentDetails.cardHolder}
                      handelChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          cardHolder: e.target.value,
                        })
                      }
                    />
                  </div>
                </Delivery>
                <Button
                  text="Place Order"
                  small
                  isLoading={buttonLoad}
                  isDisabled={buttonLoad}
                  onClick={PlaceOrder}
                />
              </Right>
            </Wrapper>
          )}
        </Section>
      )}
    </Container>
  );
};

export default Cart;
