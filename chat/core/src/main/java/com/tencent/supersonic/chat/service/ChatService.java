package com.tencent.supersonic.chat.service;

import com.github.pagehelper.PageInfo;
import com.tencent.supersonic.auth.api.authentication.pojo.User;
import com.tencent.supersonic.chat.api.pojo.ChatContext;
import com.tencent.supersonic.chat.api.pojo.QueryContext;
import com.tencent.supersonic.chat.api.pojo.SemanticParseInfo;
import com.tencent.supersonic.chat.api.pojo.response.QueryResult;
import com.tencent.supersonic.chat.persistence.dataobject.ChatDO;
import com.tencent.supersonic.chat.persistence.dataobject.ChatQueryDO;
import com.tencent.supersonic.chat.api.pojo.response.QueryResponse;
import com.tencent.supersonic.chat.api.pojo.request.PageQueryInfoReq;
import java.util.List;

public interface ChatService {

    /***
     * get the domain from context
     * @param chatId
     * @return
     */
    public Long getContextDomain(Integer chatId);

    public ChatContext getOrCreateContext(int chatId);

    public void updateContext(ChatContext chatCtx);

    public void updateContext(ChatContext chatCtx, QueryContext queryCtx, SemanticParseInfo semanticParseInfo);

    public void switchContext(ChatContext chatCtx);

    public Boolean addChat(User user, String chatName);

    public List<ChatDO> getAll(String userName);

    public boolean updateChatName(Long chatId, String chatName, String userName);

    public boolean updateFeedback(Integer id, Integer score, String feedback);

    public boolean updateChatIsTop(Long chatId, int isTop);

    Boolean deleteChat(Long chatId, String userName);

    PageInfo<QueryResponse> queryInfo(PageQueryInfoReq pageQueryInfoCommend, long chatId);

    public void addQuery(QueryResult queryResult, QueryContext queryContext, ChatContext chatCtx);

    public ChatQueryDO getLastQuery(long chatId);

    public int updateQuery(ChatQueryDO chatQueryDO);
}