import React from "react";
import PropTypes from "prop-types";
import {
  StyledTableCell,
  StyledTableRow,
} from "../../../components/CustomTable";
import {
  Box,
  Avatar,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Typography,
} from "@mui/material";
import chainDenoms from "../../../utils/chainDenoms.json";
import { useSelector } from "react-redux";
import { parseBalance } from "../../../utils/denom";
import { paddingTopBottom } from "../overview/ChainsOverview";

const Assets = (props) => {
  const { balances, chainName, currentChainDenom } = props;

  const tokensPriceInfo = useSelector(
    (state) => state.common?.allTokensInfoState?.info
  );
  const ibcChainLogoUrl =
    "https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/";

  return (
    <div>
      <TableContainer>
        {balances?.length ? (
          <Table>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell sx={paddingTopBottom}>
                  Available Balance
                </StyledTableCell>
                <StyledTableCell sx={paddingTopBottom}>Price</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {balances?.map((item, index) => {
                const denomInfo = chainDenoms[chainName]?.filter((x) => {
                  return x.denom === item.denom;
                });
                return denomInfo?.length ? (
                  <StyledTableRow key={index}>
                    <StyledTableCell size="small">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={ibcChainLogoUrl + denomInfo[0]?.image}
                          sx={{
                            width: 28,
                            height: 28,
                          }}
                        />
                        &nbsp;&nbsp;
                        <Box>
                          <Typography
                            sx={{
                              textTransform: "capitalize",
                            }}
                          >
                            <Typography sx={{ display: "inline" }}>
                              {parseBalance(
                                balances,
                                denomInfo[0]?.decimals,
                                item.denom
                              ).toLocaleString()}
                              &nbsp;
                            </Typography>
                            <Typography
                              sx={{ display: "inline", fontWeight: 600 }}
                            >
                              {denomInfo[0]?.symbol}
                            </Typography>
                            {currentChainDenom !==
                            denomInfo[0]?.origin_denom ? (
                              <Typography
                                sx={{
                                  backgroundColor: "#767676",
                                  borderRadius: "4px",
                                  ml: "4px",
                                  px: "4px",
                                  fontWeight: 600,
                                  display: "inline",
                                  color: "white",
                                  fontSize: "12px",
                                }}
                              >
                                IBC
                              </Typography>
                            ) : null}
                          </Typography>
                        </Box>
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>
                      {tokensPriceInfo[denomInfo[0]?.origin_denom]
                        ? `$${parseFloat(
                            tokensPriceInfo[denomInfo[0]?.origin_denom]?.info?.[
                              "usd"
                            ]
                          ).toFixed(2)}`
                        : "N/A"}
                    </StyledTableCell>
                  </StyledTableRow>
                ) : (
                  <></>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Typography
            sx={{
              textTransform: "capitalize",
            }}
          >
            No Assets
          </Typography>
        )}
      </TableContainer>
    </div>
  );
};

Assets.propTypes = {
  balances: PropTypes.object.isRequired,
  chainID: PropTypes.string.isRequired,
  currentChainDenom: PropTypes.string.isRequired,
};

export default Assets;
