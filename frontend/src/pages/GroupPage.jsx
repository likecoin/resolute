import React, { lazy, Suspense, useEffect, useState } from "react";
import Box from "@mui/system/Box";
import { Button, Paper } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import GroupTab, { TabPanel } from "../components/group/GroupTab";
import CardSkeleton from "../components/group/CardSkeleton";
import { useDispatch, useSelector } from "react-redux";
import SelectNetwork from "../components/common/SelectNetwork";
import {
  resetError,
  resetTxHash,
  removeFeegrant as removeFeegrantState,
  setFeegrant as setFeegrantState,
} from "../features/common/commonSlice";
import {
  getFeegrant,
  removeFeegrant as removeFeegrantLocalState,
} from "../utils/localStorage";
import FeegranterInfo from "../components/FeegranterInfo";
import AddIcon from "@mui/icons-material/Add";

const AdminGroupList = lazy(() => import("./group/AdminGroupList"));
const MemberGroupList = lazy(() => import("./group/MemberGroupList"));

export default function GroupPage() {
  const [tab, setTab] = useState(0);

  const handleTabChange = (value) => {
    setTab(value);
  };

  const params = useParams();
  const dispatch = useDispatch();

  const selectedNetwork = useSelector(
    (state) => state.common.selectedNetwork.chainName
  );
  const [currentNetwork, setCurrentNetwork] = React.useState(
    params?.networkName || selectedNetwork.toLowerCase()
  );

  const nameToChainIDs = useSelector((state) => state.wallet.nameToChainIDs);
  const feegrant = useSelector(
    (state) => state.common.feegrant?.[currentNetwork] || {}
  );

  const navigate = useNavigate();
  function navigateTo(path) {
    navigate(path);
  }

  useEffect(() => {
    if (params?.networkName?.length > 0) setCurrentNetwork(params.networkName);
    else setCurrentNetwork("cosmoshub");
  }, [params]);

  useEffect(() => {
    return () => {
      dispatch(resetError());
      dispatch(resetTxHash());
    };
  }, []);

  useEffect(() => {
    const currentChainGrants = getFeegrant()?.[currentNetwork];
    dispatch(
      setFeegrantState({
        grants: currentChainGrants,
        chainName: currentNetwork.toLowerCase(),
      })
    );
  }, [currentNetwork]);

  const removeFeegrant = () => {
    // Should we completely remove feegrant or only for this session.
    dispatch(removeFeegrantState(currentNetwork));
    removeFeegrantLocalState(currentNetwork);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "end",
          p: 1,
          pr: 0,
        }}
        component="div"
      >
        {feegrant?.granter?.length > 0 ? (
          <FeegranterInfo
            feegrant={feegrant}
            onRemove={() => {
              removeFeegrant();
            }}
          />
        ) : null}
        <SelectNetwork
          onSelect={(name) => {
            navigate(`/${name}/groups`);
          }}
          networks={Object.keys(nameToChainIDs)}
          defaultNetwork={currentNetwork.toLowerCase().replace(/ /g, "")}
        />
      </Box>
      <Box
        sx={{
          mb: 1,
          textAlign: "right",
        }}
      >
        <Button
          variant="contained"
          disableElevation
          sx={{
            textTransform: "none",
          }}
          onClick={() => navigateTo(`/${currentNetwork}/groups/create-group`)}
          startIcon={<AddIcon />}
          size="small"
        >
          New Group
        </Button>
      </Box>

      <Paper variant={"outlined"} elevation={0}>
        <GroupTab
          tabs={[
            {
              disabled: false,
              title: "Created By me",
            },
            {
              disabled: false,
              title: "Part of",
            },
          ]}
          handleTabChange={handleTabChange}
        />

        <TabPanel value={tab} index={0} key="admin">
          <Suspense fallback={<CardSkeleton />}>
            <AdminGroupList />
          </Suspense>
        </TabPanel>

        <TabPanel value={tab} index={1} key="member">
          <Suspense fallback={<CardSkeleton />}>
            <MemberGroupList />
          </Suspense>
        </TabPanel>
      </Paper>
    </>
  );
}
