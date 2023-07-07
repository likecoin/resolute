import React, { lazy, Suspense, useEffect, useState } from "react";
import Box from "@mui/system/Box";
import Button from "@mui/material/Button";
import { Paper } from "@mui/material";
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

const AdminGroupList = lazy(() => import("./group/AdminGroupList"));
const MemberGroupList = lazy(() => import("./group/MemberGroupList"));

export default function GroupPage() {
  const [tab, setTab] = useState(0);
  const dispatch = useDispatch();

  const handleTabChange = (value) => {
    setTab(value);
  };

  const params = useParams();

  const selectedNetwork = useSelector(
    (state) => state.common.selectedNetwork.chainName
  );
  const [currentNetwork, setCurrentNetwork] = React.useState(
    params?.networkName || selectedNetwork.toLowerCase()
  );

  const nameToChainIDs = useSelector((state) => state.wallet.nameToChainIDs);
  const feegrant = useSelector(
    (state) => state.common.feegrant?.[currentNetwork]
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
  }, [currentNetwork, params]);

  const removeFeegrant = () => {
    // Should we completely remove feegrant or only for this session.
    dispatch(removeFeegrantState(currentNetwork));
    removeFeegrantLocalState(currentNetwork);
  };

  return (
    <Box sx={{ p: 1 }}>
      {feegrant?.granter?.length > 0 ? (
        <FeegranterInfo
          feegrant={feegrant}
          onRemove={() => {
            removeFeegrant();
          }}
        />
      ) : null}
      <Box
        sx={{
          display: "flex",
          justifyContent: "end",
        }}
      >
        <SelectNetwork
          onSelect={(name) => {
            navigate(`/${name}/daos`);
          }}
          networks={Object.keys(nameToChainIDs)}
          defaultNetwork={currentNetwork.toLowerCase().replace(/ /g, "")}
        />
      </Box>
      <Box
        component="div"
        sx={{
          mb: 1,
          mt: 2,
          textAlign: "right",
        }}
      >
        <Button
          variant="contained"
          disableElevation
          onClick={() => {
            navigateTo(`/${currentNetwork}/daos/create-group`);
          }}
          sx={{
            textTransform: "none",
          }}
        >
          Create Group
        </Button>
      </Box>
      <Paper sx={{ mt: 2 }} variant={"outlined"} elevation={0}>
        <Box>
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
        </Box>
      </Paper>
    </Box>
  );
}
