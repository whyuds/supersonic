import { Popover, message, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect, Helmet, history, useParams, useRouteMatch, useLocation } from 'umi';
import DomainListTree from './components/DomainList';

import styles from './components/style.less';
import type { StateType } from './model';
import { DownOutlined } from '@ant-design/icons';
import { ISemantic } from './data';
import { getDomainList, getModelList } from './service';
import ChatSettingTab from './ChatSetting/ChatSettingTab';
import DomainManagerTab from './components/DomainManagerTab';
import type { Dispatch } from 'umi';

type Props = {
  mode: 'domain' | 'chatSetting';
  domainManger: StateType;
  dispatch: Dispatch;
};

const OverviewContainer: React.FC<Props> = ({ mode, domainManger, dispatch }) => {
  const params: any = useParams();
  const domainId = params.domainId;
  const modelId = params.modelId;

  const menuKey = params.menuKey ? params.menuKey : !Number(modelId) ? 'overview' : '';
  const { selectDomainId, selectModelId, selectDomainName, selectModelName, domainList } =
    domainManger;
  const [modelList, setModelList] = useState<ISemantic.IDomainItem[]>([]);
  const [isModel, setIsModel] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string>(menuKey);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const initSelectedDomain = (domainList: ISemantic.IDomainItem[]) => {
    const targetNode = domainList.filter((item: any) => {
      return `${item.id}` === domainId;
    })[0];

    if (!targetNode) {
      const firstRootNode = domainList.filter((item: any) => {
        return item.parentId === 0;
      })[0];
      if (firstRootNode) {
        const { id, name } = firstRootNode;
        dispatch({
          type: 'domainManger/setSelectDomain',
          selectDomainId: id,
          selectDomainName: name,
          domainData: firstRootNode,
        });
        setActiveKey(menuKey);
        pushUrlMenu(id, 0, menuKey);
      }
    } else {
      const { id, name } = targetNode;
      dispatch({
        type: 'domainManger/setSelectDomain',
        selectDomainId: id,
        selectDomainName: name,
        domainData: targetNode,
      });
    }
  };

  const initProjectTree = async () => {
    const { code, data, msg } = await getDomainList();
    if (code === 200) {
      initSelectedDomain(data);
      dispatch({
        type: 'domainManger/setDomainList',
        payload: { domainList: data },
      });
    } else {
      message.error(msg);
    }
  };

  useEffect(() => {
    initProjectTree();
  }, []);

  useEffect(() => {
    if (!selectDomainId) {
      return;
    }
    queryModelList();
    dispatch({
      type: 'domainManger/queryDatabaseByDomainId',
      payload: {
        domainId: selectDomainId,
      },
    });
  }, [selectDomainId]);

  const queryModelList = async () => {
    const { code, data } = await getModelList(selectDomainId);
    if (code === 200) {
      setModelList(data);
      const model = data.filter((item: any) => {
        return `${item.id}` === modelId;
      })[0];
      if (model) {
        const { id, name } = model;
        dispatch({
          type: 'domainManger/setSelectModel',
          selectModelId: id,
          selectModelName: name,
          modelData: model,
        });
        setActiveKey(menuKey);
        setIsModel(true);
        pushUrlMenu(selectDomainId, id, menuKey);
      }
    } else {
      message.error('获取模型列表失败!');
    }
  };

  useEffect(() => {
    if (!selectDomainId) {
      return;
    }
    setIsModel(false);
    setActiveKey(menuKey);
  }, [domainList, selectDomainId]);

  const initModelConfig = () => {
    setIsModel(true);
    const currentMenuKey = menuKey === 'overview' ? '' : menuKey;
    pushUrlMenu(selectDomainId, selectModelId, currentMenuKey);
    setActiveKey(currentMenuKey);
  };

  useEffect(() => {
    if (!selectModelId) {
      return;
    }
    initModelConfig();
    dispatch({
      type: 'domainManger/queryDimensionList',
      payload: {
        modelId: selectModelId,
      },
    });
    dispatch({
      type: 'domainManger/queryMetricList',
      payload: {
        modelId: selectModelId,
      },
    });
  }, [selectModelId]);

  const pushUrlMenu = (domainId: number, modelId: number, menuKey: string) => {
    const path = mode === 'domain' ? 'semanticModel' : 'chatSetting';
    history.push(`/${path}/model/${domainId}/${modelId || 0}/${menuKey}`);
  };

  const handleModelChange = (model?: ISemantic.IModelItem) => {
    queryModelList();
    if (!model) {
      return;
    }
    if (`${model.id}` === `${selectModelId}`) {
      initModelConfig();
    }
    const { id, name } = model;
    dispatch({
      type: 'domainManger/setSelectModel',
      selectModelId: id,
      selectModelName: name,
      modelData: model,
    });
  };

  const cleanModelInfo = (domainId: number) => {
    setIsModel(false);
    pushUrlMenu(domainId, 0, 'overview');
    setActiveKey('overview');
    dispatch({
      type: 'domainManger/setSelectModel',
      selectModelId: 0,
      selectModelName: '',
      modelData: undefined,
    });
  };

  return (
    <div className={styles.projectBody}>
      <Helmet title={'模型管理-超音数'} />
      <div className={styles.projectManger}>
        <h2 className={styles.title}>
          <Popover
            zIndex={1000}
            overlayInnerStyle={{
              overflow: 'scroll',
              maxHeight: '800px',
            }}
            content={
              <DomainListTree
                createDomainBtnVisible={mode === 'domain' ? true : false}
                onTreeSelected={(domainData) => {
                  setOpen(false);
                  const { id, name } = domainData;
                  cleanModelInfo(id);
                  dispatch({
                    type: 'domainManger/setSelectDomain',
                    selectDomainId: id,
                    selectDomainName: name,
                    domainData,
                  });
                }}
                onTreeDataUpdate={() => {
                  initProjectTree();
                }}
              />
            }
            trigger="click"
            open={open}
            onOpenChange={handleOpenChange}
          >
            <div className={styles.domainSelector}>
              <span className={styles.domainTitle}>
                <Space>
                  {selectDomainName ? `当前主题域：${selectDomainName}` : '主题域信息'}
                  {selectModelName && (
                    <>
                      <span style={{ position: 'relative', top: '-2px' }}> | </span>
                      <span style={{ fontSize: 16, color: '#296DF3' }}>{selectModelName}</span>
                    </>
                  )}
                </Space>
              </span>
              <span className={styles.downIcon}>
                <DownOutlined />
              </span>
            </div>
          </Popover>
        </h2>

        {selectDomainId ? (
          <>
            {mode === 'domain' ? (
              <DomainManagerTab
                isModel={isModel}
                activeKey={activeKey}
                modelList={modelList}
                handleModelChange={(model) => {
                  handleModelChange(model);
                }}
                onBackDomainBtnClick={() => {
                  cleanModelInfo(selectDomainId);
                }}
                onMenuChange={(menuKey) => {
                  setActiveKey(menuKey);
                  pushUrlMenu(selectDomainId, selectModelId, menuKey);
                }}
              />
            ) : (
              <ChatSettingTab
                isModel={isModel}
                activeKey={activeKey}
                modelList={modelList}
                handleModelChange={(model) => {
                  handleModelChange(model);
                }}
                onBackDomainBtnClick={() => {
                  cleanModelInfo(selectDomainId);
                }}
                onMenuChange={(menuKey) => {
                  setActiveKey(menuKey);
                  pushUrlMenu(selectDomainId, selectModelId, menuKey);
                }}
              />
            )}
          </>
        ) : (
          <h2 className={styles.mainTip}>请选择项目</h2>
        )}
      </div>
    </div>
  );
};

export default connect(({ domainManger }: { domainManger: StateType }) => ({
  domainManger,
}))(OverviewContainer);