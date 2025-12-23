import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { 
  Copy, 
  FileText, 
  CheckCircle, 
  Info, 
  Search, 
  AlertTriangle, 
  Trash2, 
  DollarSign, 
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Upload,
  Image as ImageIcon,
  Calendar,
  MessageCircle,
  Send,
  Smile,
  Video,
  Paperclip,
  User,
  ListFilter,
  SlidersHorizontal,
  Activity,
  Zap,
  LayoutDashboard,
  Wallet,
  ClipboardList,
  Megaphone,
  Bell,
  Check,
  Users,
  Settings,
  MapPin,
  Clock,
  Tag,
  Eye,
  Phone,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

// --- 类型定义 ---

enum OrderStatus {
  PendingDispatch = '待派单',
  Completed = '已完成',
  Void = '作废',
  Returned = '已退回',
  Error = '报错'
}

interface Order {
  id: number;
  orderNo: string;
  workOrderNo: string;
  dispatchTime: string;
  mobile: string;
  serviceItem: string;
  serviceRatio: '3:7' | '2:8' | '4:6'; 
  status: OrderStatus;
  returnReason?: string; 
  errorDetail?: string; 
  region: string;
  address: string;
  details: string;
  recordTime: string;
  source: string;
  totalAmount: number;
  cost: number;
  hasAdvancePayment: boolean; 
  depositAmount?: number;
  weightedCoefficient: number;
  regionPeople: number;
  isReminded: boolean;
  suggestedMethod: string; // 建议方式
  guidePrice: number;      // 划线价
  historicalPrice: string; // 历史价 (改为字符串区间)

  // --- 新增字段 ---
  hasCoupon: boolean;      // 是否有券
  isCouponVerified: boolean; // 是否验券
  isRead: boolean;         // 是否已读
  isCalled: boolean;       // 是否拨打
  warrantyPeriod: string;  // 质保期
  workPhone: string;       // 工作机
  customerName: string;    // 客户姓名
  dispatcherName: string;  // 派单员
  recorderName: string;    // 录单员
  masterName: string;      // 师傅
  masterPhone: string;     // 师傅手机号 (新增)
  totalReceipt: number;    // 总收款
  // cost 已存在
  revenue: number;         // 业绩
  actualPaid: number;      // 实付金额
  advancePaymentAmount: number; // 垫付金额
  otherReceipt: number;    // 其他收款
  completionIncome: number; // 完工收入
  completionTime: string;  // 完成时间
  paymentTime: string;     // 收款时间
  serviceTime: string;     // 服务时间
  voiderNameAndReason: string; // 作废人/作废原因
  voidDetails: string;     // 作废详情
  cancelReasonAndDetails: string; // 取消原因/取消详情
  favoriteRemark: string;  // 收藏备注
}

// --- 辅助函数 ---
const formatCurrency = (amount: number) => {
  return Number.isInteger(amount) ? amount.toString() : amount.toFixed(1);
};

const formatDate = (date: Date) => {
  return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// --- Mock 数据生成 ---

// 1. 订单收款 Mock
const generatePaymentData = () => Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  orderNo: `PAY-2023-${String(i).padStart(4, '0')}`,
  dispatcher: `客服${['A', 'B', 'C'][i % 3]}`,
  finishTime: '2025-12-20 14:00:00',
  payRecordTime: '2025-12-20 14:05:00',
  mobile: `138${String(Math.random()).slice(2, 10)}`,
  amount: (100 + i * 10).toFixed(2),
  method: ['微信', '支付宝', '现金'][i % 3],
  coupon: i % 3 === 0 ? '满100减10' : '-',
  verifyStatus: i % 3 === 0 ? '已核销' : '未核销',
  storeName: '总店',
  verifyAmount: i % 3 === 0 ? '10.00' : '0.00',
  verifyTime: i % 3 === 0 ? '2025-12-20 14:01:00' : '-',
  failReason: '-',
  remark: '正常收款',
  creator: `财务${i % 2}`
}));

// 2. 报错订单 Mock
const generateErrorData = () => Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  orderNo: `ERR-2023-${String(i).padStart(4, '0')}`,
  reportTime: '2025-12-19 09:18:11',
  mobile: `139${String(Math.random()).slice(2, 10)}`,
  source: '用户反馈',
  workPhone: '010-88888888',
  clientName: `客户${String.fromCharCode(65 + i)}`,
  status: ['待处理', '处理中', '已解决'][i % 3],
  recorder: `张三`,
  master: `李师傅`,
  dispatcher: `王五`,
  reporter: `赵六`,
  type: ['服务态度', '质量问题', '迟到'][i % 3],
  detail: '客户投诉师傅未按时到达',
  processDetail: '已联系师傅核实',
  processTime: '2025-12-19 10:00:00',
  solution: '赔偿优惠券',
  solver: '经理A',
  solveTime: '2025-12-19 12:00:00'
}));

// 3. 直派订单 Mock
const generateDirectDispatchData = () => Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  orderNo: `DIR-2023-${String(i).padStart(4, '0')}`,
  merchant: '美团',
  merchantOrderNo: `MT-${String(Math.random()).slice(2, 8)}`,
  status: '已接单',
  region: '北京市/朝阳区',
  address: '朝阳北路101号',
  detail: '深度保洁',
  source: 'API对接',
  workPhone: '15000000000',
  clientName: '李女士',
  master: '王大锤',
  creator: '系统自动',
  masterId: `M-${i}`,
  creatorId: `S-001`,
  opTime: '2025-12-20 08:00',
  cancelReason: '-',
  cancelTime: '-',
  recordTime: '2025-12-20 07:55',
  receiveTime: '2025-12-20 08:05',
  total: 200,
  cost: 150,
  revenue: 50,
  paid: 200,
  deposit: 0,
  rest: 0,
  remark: '无',
  finishIncome: 50,
  map: '查看',
}));

// 4. 派单业绩 Mock
const generatePerformanceData = () => Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  dispatcher: `派单员${String.fromCharCode(65 + i)}`,
  total: (5000 + i * 100).toFixed(2),
  manualOffline: (1000 + i * 50).toFixed(2),
  manualPlatform: (2000 + i * 20).toFixed(2),
  manualTotal: (3000 + i * 70).toFixed(2),
  autoOffline: (500 + i * 10).toFixed(2),
  autoPlatform: (1500 + i * 20).toFixed(2),
  autoTotal: (2000 + i * 30).toFixed(2),
}));

// 5. 改单记录 Mock
const generateChangeData = () => Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  seq: 283 - i,
  orderNo: `251216037${229 - i}`,
  updateTime: '2025-12-18 14:25:09',
  mobile: `180${String(Math.random()).slice(2, 10)}`,
  operator: ['管理员', '张三', '陈清平'][i % 3],
}));

// 6. 长期订单 Mock
const generateLongTermData = () => Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  orderNo: `251216091${0 + i}`,
  mobile: `173${String(Math.random()).slice(2, 10)}`,
  clientName: i % 3 === 0 ? '3' : '',
  status: ['待处理', '待核销', '已退回', '已完成'][i % 4],
  master: ['许仙', '萧炎', '于谦'][i % 3],
  recorder: '张三',
  dispatcher: ['陈清平', '谢德华', '管理员'][i % 3],
  createTime: '2025-12-16 11:22:18',
  reason: ['你体验', '不合适', '通过后', 'u哈哈哈'][i % 4],
  material: '点击查看'
}));

// 7. 转派记录 Mock
const generateTransferData = () => Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  orderNo: `251218160${65893 - i}`,
  createTime: '2025-12-18 16:07:04',
  mobile: `181${String(Math.random()).slice(2, 10)}`,
  operator: ['管理员', '陈清平', '张三'][i % 3],
  transferTo: ['管理员', '张士钦', '李四'][i % 3],
  remark: i % 2 === 0 ? '是' : '水电费',
  creator: '管理员'
}));

// 8. 派单记录 Mock
const generateDispatchRecordData = () => Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  orderNo: `251218160${65893 - i}`,
  dispatchTime: '2025-12-18 16:07:04',
  mobile: `181${String(Math.random()).slice(2, 10)}`,
  dispatcher: ['管理员', '陈清平', '张三'][i % 3],
  method: '自动派单',
  techFeeStatus: '未缴纳',
  type: '普通单',
  remark: '无',
  pic: '查看',
  creator: '管理员',
  createTime: '2025-12-18 16:00:00',
  status: '已派单',
  master: '王师傅',
  masterId: '10086',
  acceptTime: '2025-12-18 16:10:00',
  appointTime: '2025-12-19 10:00:00',
  rejectReason: '-',
  grabTime: '-',
  finishTime: '-',
  masterRemark: '-',
  returnReason: '-',
  returnTime: '-',
}));

// 9. 录单价格 Mock
const generateRecordingPriceData = () => Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  price: (100 + i * 20).toFixed(2),
  systemName: '日常价格',
  item: ['家具拆装', '打印机维修', '燃气灶维修'][i % 3],
  region: ['广东省广州市白云区', '陕西省西安市雁塔区', '北京市海淀区'][i % 3],
  remark: i === 0 ? '这是广东省白云区的报价表，请根据师傅沟通的价格进行付款' : (i === 1 ? '小问题维修和大问题维修价格不一样，具体师傅沟通' : '无'),
}));

// 10. 报价 Mock
const generateQuotationData = () => Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  city: ['山东省枣庄市滕州市', '湖北省孝感市应城市', '北京市东城区'][i % 3],
  item: ['名酒回收', '手机回收', '甲醛检测'][i % 3],
  time: '0-23',
  type: '日常价格',
  publicPrice: i > 1 ? (Math.random() * 100).toFixed(2) : '',
  basePrice: i > 1 ? (Math.random() * 80).toFixed(2) : '',
  linePrice: i > 1 ? (Math.random() * 120).toFixed(2) : '',
  ratio: '0.04',
  content: i === 0 ? '机器人类单自动匹配详情的价格信息30一次' : '按平方数计算',
  pic: i === 2 ? '查看图片' : '',
  remark: i === 2 ? '是给事' : '',
}));

// 11. 待入单库 Mock
const generatePendingEntryData = () => Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  orderNo: `251218160${65893 - i}`,
  createTime: '2025-12-18 16:07:04',
  mobile: `181${String(Math.random()).slice(2, 10)}`,
  item: '家电清洗',
  status: '待处理',
  region: '北京市朝阳区',
  address: '朝阳北路大悦城',
  detail: '深度清洗',
  source: '美团',
  workPhone: '13800000000',
  clientName: '张先生',
  clientRemark: '下午三点后',
  isFake: '否',
  cancelReason: '-',
  cancelDetail: '-',
}));

// 12. 单库 Mock
const generateOrderLibraryData = () => Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  isValid: '是',
  isVisible: '是',
  isCalled: '是',
  recordTime: '2025-12-18 16:07',
  signupTime: '2025-12-18 16:00',
  status: '已完成',
  region: '上海市浦东新区',
  address: '陆家嘴环路',
  detail: '办公室清洁',
  source: '58同城',
  workPhone: '13900000000',
  recorder: '李四',
  dispatcher: '王五',
  master: '赵六',
  masterId: 'M001',
  voidTime: '-',
  voidReason: '-',
  revokeReason: '-',
  revokeTime: '-',
  dispatchTime: '2025-12-18 16:30',
  total: 500,
  cost: 300,
  revenue: 200,
  paid: 500,
  deposit: 0,
  remark: '无',
  finishIncome: 200,
  csRemark: '客户满意'
}));

// 13. 微信收款 Mock
const generateWeChatCollectionData = () => Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  dispatcher: `客服${['A', 'B', 'C'][i % 3]}`,
  wechatTotal: (1000 + i * 50).toFixed(2),
  offlineTotal: (500 + i * 30).toFixed(2),
  otherTotal: (100 + i * 10).toFixed(2),
}));

const generateMockData = (): Order[] => {
  return Array.from({ length: 128 }).map((_, i) => ({
    id: i + 1,
    orderNo: `20231220${String(i).padStart(4, '0')}`,
    workOrderNo: `WO-${String(i).padStart(4, '0')}`,
    dispatchTime: '2023-12-20 10:00',
    mobile: `138${String(Math.random()).slice(2, 10)}`,
    serviceItem: i % 3 === 0 ? '空调清洗' : '冰箱维修',
    serviceRatio: '3:7',
    status: i % 5 === 0 ? OrderStatus.PendingDispatch : OrderStatus.Completed,
    region: '北京市朝阳区',
    address: '某某小区1号楼101',
    details: '客户备注需要带鞋套',
    recordTime: '2023-12-19 14:00',
    source: '美团',
    totalAmount: 200,
    cost: 50,
    hasAdvancePayment: i % 4 === 0,
    depositAmount: i % 4 === 0 ? 50 : 0,
    weightedCoefficient: 1.2,
    regionPeople: 5,
    isReminded: false,
    suggestedMethod: '一口价',
    guidePrice: 180,
    historicalPrice: '150-200',
    hasCoupon: i % 3 === 1,
    isCouponVerified: i % 3 === 1,
    isRead: i % 2 === 0,
    isCalled: i % 2 === 1,
    warrantyPeriod: '90天',
    workPhone: '13900000000',
    customerName: '张三',
    dispatcherName: '李四',
    recorderName: '王五',
    masterName: '赵六',
    masterPhone: '13700000000',
    totalReceipt: 200,
    revenue: 150,
    actualPaid: 200,
    advancePaymentAmount: 0,
    otherReceipt: 0,
    completionIncome: 150,
    completionTime: '2023-12-20 12:00',
    paymentTime: '2023-12-20 12:05',
    serviceTime: '2023-12-20 10:30',
    voiderNameAndReason: '',
    voidDetails: '',
    cancelReasonAndDetails: '',
    favoriteRemark: ''
  }));
};

const FULL_MOCK_DATA = generateMockData();

// --- 基础组件定义 ---

const NotificationBar = () => {
  return (
    <div className="mb-3 bg-[#111827] rounded-md px-4 py-2.5 flex items-center gap-4 overflow-hidden relative shadow-sm border border-slate-800">
      <div className="flex items-center gap-1.5 bg-[#EF4444] text-white px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap flex-shrink-0">
        <span>重要公告</span>
        <Bell size={12} fill="currentColor" />
      </div>
      <div className="flex-1 overflow-hidden relative h-5 group flex items-center">
        <Megaphone size={16} className="text-[#EF4444] mr-3 flex-shrink-0" />
        <div className="flex-1 overflow-hidden relative h-full">
          <div className="absolute whitespace-nowrap animate-marquee text-xs text-gray-300 flex items-center h-full font-medium">
            <span className="mr-16">关于 2025 年度秋季职级晋升评审的通知：点击下方详情以阅读完整公告内容。请所有相关人员务必在截止日期前完成确认。</span>
            <span className="mr-16">📢 系统升级通知：今晚 24:00 将进行系统维护，预计耗时 30 分钟。</span>
            <span className="mr-16">🔥 10月业绩pk赛圆满结束，恭喜华东大区获得冠军！</span>
          </div>
        </div>
      </div>
      <div className="text-slate-400 text-xs font-medium bg-slate-800 px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap">
        2025-11-19
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .group:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

const QuickNav = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => {
  const items = [
    '订单管理', '订单收款', '报错订单', '直派订单', '派单业绩', '改单记录', '长期订单',
    '转派记录', '派单记录', '录单价格', '报价', '待入单库', '单库', '微信收款'
  ];

  return (
    <div className="grid grid-cols-7 gap-3 mb-3 px-1">
      {items.map((item, index) => (
        <button 
          key={index} 
          onClick={() => onTabChange(item)}
          className={`h-9 rounded-md text-xs font-bold shadow-sm transition-all hover:brightness-95 active:scale-95 bg-[#F0F9FE] text-[#007AFF] border border-[#93C5FD]
            ${activeTab === item ? 'ring-2 ring-offset-2 ring-blue-500 scale-105 z-10' : ''}`}
        >
          {item}
        </button>
      ))}
    </div>
  );
};

// 通用数据概览组件
const DataOverview = ({ items }: { items: { label: string; value: string | number }[] }) => {
  return (
    <div className="flex gap-6 mb-3 px-2 text-xs font-medium text-slate-600 bg-white border border-slate-100 p-2 rounded-lg shadow-sm">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-1 items-center">
          <span className="text-slate-500">{item.label}:</span>
          <span className="font-bold text-slate-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// 通用操作栏 + 筛选容器
const FilterContainer = ({ 
  children, 
  onToggleSearch, 
  isSearchOpen,
  extraButtons 
}: { 
  children?: React.ReactNode; 
  onToggleSearch: () => void; 
  isSearchOpen: boolean;
  extraButtons?: React.ReactNode
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-3 px-1">
         <div className="flex items-center gap-3">
            {extraButtons}
         </div>
         <button 
            onClick={onToggleSearch}
            className={`flex items-center gap-1.5 transition-all active:scale-95 px-5 py-1.5 rounded shadow-md h-8 text-xs font-medium ml-auto
              ${isSearchOpen 
                ? 'bg-blue-700 text-white shadow-blue-300' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
          >
              <Settings size={14} />
              <span>{isSearchOpen ? '收起高级筛选' : '点这高级筛选'}</span>
              {isSearchOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
      </div>
      {isSearchOpen && (
        <div className="shadow-sm mb-3 rounded-lg border border-blue-200 bg-[#F0F7FF] px-4 py-3 animate-in fade-in slide-in-from-top-2">
            {children}
        </div>
      )}
    </>
  )
}

// --- 独立 Tab 视图组件 ---

// 1. 转派记录视图
const TransferRecordView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateTransferData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}>
         <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">订单号/手机号</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-48" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">操作人员</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">转给人</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32" placeholder="请输入内容" /></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs">重置</button>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr>
              {['序号','订单号','创建时间','手机号','操作人员','转给人','备注','创建人'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {data.map((row, i) => (
               <tr key={row.id} className="hover:bg-blue-50">
                 <td className="px-3 py-2 text-center">{row.id}</td>
                 <td className="px-3 py-2">{row.orderNo}</td>
                 <td className="px-3 py-2">{row.createTime}</td>
                 <td className="px-3 py-2">{row.mobile}</td>
                 <td className="px-3 py-2">{row.operator}</td>
                 <td className="px-3 py-2">{row.transferTo}</td>
                 <td className="px-3 py-2">{row.remark}</td>
                 <td className="px-3 py-2">{row.creator}</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-slate-500 px-2 flex justify-center gap-2 items-center">
         <span>共 398 条</span>
         <select className="border text-xs"><option>10条/页</option></select>
         <button className="border px-2 py-0.5 bg-blue-500 text-white rounded">1</button>
         <button className="border px-2 py-0.5 rounded">2</button>
         <button className="border px-2 py-0.5 rounded">3</button>
         <span>...</span>
         <button className="border px-2 py-0.5 rounded">60</button>
         <button className="border px-2 py-0.5 rounded">{'>'}</button>
         <span>前往 <input className="w-8 border text-center"/> 页</span>
       </div>
    </div>
  );
};

// 2. 派单记录视图
const DispatchRecordView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateDispatchRecordData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-2">
         {/* Placeholder DataOverview as per request "show data overview data" */}
         <DataOverview items={[{ label: '派单总数', value: 398 }, { label: '今日派单', value: 12 }]} />
      </div>
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)} extraButtons={<button className="bg-green-500 text-white px-3 py-1 text-xs rounded">导出</button>}>
         <div className="grid grid-cols-6 gap-3">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">订单号/手机号</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" /></div>
             <div className="flex items-center gap-2 col-span-2"><span className="text-xs text-slate-500 whitespace-nowrap">派单时间</span><input type="date" className="h-7 w-full border border-blue-200 rounded px-2 text-xs" /><span className="text-xs">-</span><input type="date" className="h-7 w-full border border-blue-200 rounded px-2 text-xs" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">派单员</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">上门师傅</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">师傅uid</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">派单类型</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">派单方式</span><select className="h-7 w-full border border-blue-200 rounded px-2 text-xs"><option>请选择</option></select></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">状态</span><select className="h-7 w-full border border-blue-200 rounded px-2 text-xs"><option>请选择</option></select></div>
             <div className="col-span-1 flex gap-2">
                <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs w-full">搜索</button>
                <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs w-full">重置</button>
             </div>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr>
              {['序号','订单号','派单时间','手机号','派单员','派单方式','技术服务费缴纳状态','派单类型','派单备注','完工图片','创建人','创建时间','状态','上门师傅','师傅uid','接单时间','预约上门时间','拒绝原因','抢接时间','完成时间','师傅备注','退回原因','退回时间','操作'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {data.map((row, i) => (
               <tr key={row.id} className="hover:bg-blue-50">
                 <td className="px-3 py-2 text-center">{row.id}</td>
                 <td className="px-3 py-2 text-blue-600">{row.orderNo}</td>
                 <td className="px-3 py-2 whitespace-nowrap">{row.dispatchTime}</td>
                 <td className="px-3 py-2">{row.mobile}</td>
                 <td className="px-3 py-2">{row.dispatcher}</td>
                 <td className="px-3 py-2">{row.method}</td>
                 <td className="px-3 py-2">{row.techFeeStatus}</td>
                 <td className="px-3 py-2">{row.type}</td>
                 <td className="px-3 py-2">{row.remark}</td>
                 <td className="px-3 py-2 text-blue-600">{row.pic}</td>
                 <td className="px-3 py-2">{row.creator}</td>
                 <td className="px-3 py-2 whitespace-nowrap">{row.createTime}</td>
                 <td className="px-3 py-2">{row.status}</td>
                 <td className="px-3 py-2">{row.master}</td>
                 <td className="px-3 py-2">{row.masterId}</td>
                 <td className="px-3 py-2 whitespace-nowrap">{row.acceptTime}</td>
                 <td className="px-3 py-2 whitespace-nowrap">{row.appointTime}</td>
                 <td className="px-3 py-2">{row.rejectReason}</td>
                 <td className="px-3 py-2">{row.grabTime}</td>
                 <td className="px-3 py-2">{row.finishTime}</td>
                 <td className="px-3 py-2">{row.masterRemark}</td>
                 <td className="px-3 py-2">{row.returnReason}</td>
                 <td className="px-3 py-2">{row.returnTime}</td>
                 <td className="px-3 py-2 text-blue-600 cursor-pointer whitespace-nowrap">详情 修改 解决</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-slate-500 px-2 flex justify-end">共 0 条</div>
    </div>
  );
};

// 3. 录单价格视图
const RecordingPriceView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateRecordingPriceData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)} extraButtons={
        <div className="flex gap-2">
           <button className="bg-blue-600 text-white px-3 py-1 text-xs rounded">新增</button>
           <button className="bg-green-600 text-white px-3 py-1 text-xs rounded">上传excel</button>
           <button className="bg-red-400 text-white px-3 py-1 text-xs rounded">批量删除</button>
           <button className="bg-orange-400 text-white px-3 py-1 text-xs rounded">强制删除</button>
        </div>
      }>
         <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">项目</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-48" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">地域</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-48" placeholder="请输入内容" /></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs">重置</button>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr>
              <th className="px-3 py-2 w-8"><input type="checkbox" /></th>
              {['序号','价格','体系名称','项目','地域','备注','操作'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {data.map((row, i) => (
               <tr key={row.id} className="hover:bg-blue-50">
                 <td className="px-3 py-2 text-center"><input type="checkbox" /></td>
                 <td className="px-3 py-2 text-center">{row.id}</td>
                 <td className="px-3 py-2">{row.price}</td>
                 <td className="px-3 py-2">{row.systemName}</td>
                 <td className="px-3 py-2">{row.item}</td>
                 <td className="px-3 py-2">{row.region}</td>
                 <td className="px-3 py-2">{row.remark}</td>
                 <td className="px-3 py-2">
                    <span className="text-blue-600 cursor-pointer mr-2">修改</span>
                    <span className="text-red-500 cursor-pointer">删除</span>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-slate-500 px-2 flex justify-center gap-2 items-center">
         <span>共 13 条</span>
         <select className="border text-xs"><option>10条/页</option></select>
         <button className="border px-2 py-0.5 bg-blue-500 text-white rounded">1</button>
         <button className="border px-2 py-0.5 rounded">2</button>
         <button className="border px-2 py-0.5 rounded">{'>'}</button>
         <span>前往 <input className="w-8 border text-center"/> 页</span>
       </div>
    </div>
  );
};

// 4. 报价视图
const QuotationView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateQuotationData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)} extraButtons={
        <div className="flex gap-2">
           <button className="bg-blue-600 text-white px-3 py-1 text-xs rounded">新增</button>
           <button className="bg-green-600 text-white px-3 py-1 text-xs rounded">上传excel</button>
           <button className="bg-red-400 text-white px-3 py-1 text-xs rounded">批量删除</button>
           <button className="bg-orange-400 text-white px-3 py-1 text-xs rounded">强制删除</button>
           <button className="bg-blue-400 text-white px-3 py-1 text-xs rounded">添加报价图片</button>
           <button className="bg-blue-500 text-white px-3 py-1 text-xs rounded">导出</button>
        </div>
      }>
         <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">项目</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">地域</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">服务时间</span><select className="h-7 border border-blue-200 rounded px-2 text-xs w-24"><option>请选择</option></select><span className="text-xs">-</span><select className="h-7 border border-blue-200 rounded px-2 text-xs w-24"><option>请选择</option></select></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">价格类型</span><select className="h-7 border border-blue-200 rounded px-2 text-xs w-32"><option>请选择</option></select></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs">重置</button>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr>
              <th className="px-3 py-2 w-8"><input type="checkbox" /></th>
              {['序号','城市','服务项目','服务时间','价格类型','公司对外报价','师傅结算底价','划线价/成单底价','建议师傅分成比例','报价内容','报价图片','备注','操作'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {data.map((row, i) => (
               <tr key={row.id} className="hover:bg-blue-50">
                 <td className="px-3 py-2 text-center"><input type="checkbox" /></td>
                 <td className="px-3 py-2 text-center">{row.id}</td>
                 <td className="px-3 py-2">{row.city}</td>
                 <td className="px-3 py-2">{row.item}</td>
                 <td className="px-3 py-2">{row.time}</td>
                 <td className="px-3 py-2">{row.type}</td>
                 <td className="px-3 py-2">{row.publicPrice}</td>
                 <td className="px-3 py-2">{row.basePrice}</td>
                 <td className="px-3 py-2">{row.linePrice}</td>
                 <td className="px-3 py-2">{row.ratio}</td>
                 <td className="px-3 py-2 max-w-[200px] truncate" title={row.content}>{row.content}</td>
                 <td className="px-3 py-2 text-blue-600 cursor-pointer">{row.pic}</td>
                 <td className="px-3 py-2">{row.remark}</td>
                 <td className="px-3 py-2">
                    <span className="text-blue-600 cursor-pointer mr-2">修改</span>
                    <span className="text-blue-600 cursor-pointer mr-2">调价记录</span>
                    <span className="text-red-500 cursor-pointer">删除</span>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-slate-500 px-2 flex justify-center gap-2 items-center">
         <span>共 48 条</span>
         <select className="border text-xs"><option>10条/页</option></select>
         <button className="border px-2 py-0.5 bg-blue-500 text-white rounded">1</button>
         <button className="border px-2 py-0.5 rounded">2</button>
         <button className="border px-2 py-0.5 rounded">3</button>
         <button className="border px-2 py-0.5 rounded">4</button>
         <button className="border px-2 py-0.5 rounded">5</button>
         <button className="border px-2 py-0.5 rounded">{'>'}</button>
         <span>前往 <input className="w-8 border text-center"/> 页</span>
       </div>
    </div>
  );
};

// 5. 待入单库视图
const PendingEntryView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generatePendingEntryData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-2">
         <DataOverview items={[{ label: '是否刷单', value: 3 }, { label: '待处理', value: 17 }]} />
      </div>
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}>
         <div className="grid grid-cols-7 gap-3">
             <div className="flex items-center gap-2 col-span-2"><span className="text-xs text-slate-500 whitespace-nowrap">订单号/手机号/客户名称</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">订单来源</span><select className="h-7 w-full border border-blue-200 rounded px-2 text-xs"><option>请选择</option></select></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">地域</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">服务项目</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">状态</span><select className="h-7 w-full border border-blue-200 rounded px-2 text-xs"><option>请选择</option></select></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">地址</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">工作机</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2 col-span-2"><span className="text-xs text-slate-500 whitespace-nowrap">创建时间</span><input type="date" className="h-7 w-full border border-blue-200 rounded px-2 text-xs" /><span className="text-xs">-</span><input type="date" className="h-7 w-full border border-blue-200 rounded px-2 text-xs" /></div>
             <div className="col-span-2 flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">是否刷单</span><select className="h-7 w-full border border-blue-200 rounded px-2 text-xs"><option>请选择</option></select></div>
             <div className="col-span-1 flex gap-2">
                <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs w-full">搜索</button>
                <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs w-full">重置</button>
             </div>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr>
              {['序号','订单号','创建时间','手机号码','项目','状态','地域','地址','详细描述','订单来源','工作机','客户名称','客户备注','是否刷单','取消原因','取消详情','操作'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {data.map((row, i) => (
               <tr key={row.id} className="hover:bg-blue-50">
                 <td className="px-3 py-2 text-center">{row.id}</td>
                 <td className="px-3 py-2 text-blue-600">{row.orderNo}</td>
                 <td className="px-3 py-2 whitespace-nowrap">{row.createTime}</td>
                 <td className="px-3 py-2">{row.mobile}</td>
                 <td className="px-3 py-2">{row.item}</td>
                 <td className="px-3 py-2">{row.status}</td>
                 <td className="px-3 py-2">{row.region}</td>
                 <td className="px-3 py-2 max-w-[100px] truncate" title={row.address}>{row.address}</td>
                 <td className="px-3 py-2 max-w-[100px] truncate" title={row.detail}>{row.detail}</td>
                 <td className="px-3 py-2">{row.source}</td>
                 <td className="px-3 py-2">{row.workPhone}</td>
                 <td className="px-3 py-2">{row.clientName}</td>
                 <td className="px-3 py-2">{row.clientRemark}</td>
                 <td className="px-3 py-2">{row.isFake}</td>
                 <td className="px-3 py-2">{row.cancelReason}</td>
                 <td className="px-3 py-2">{row.cancelDetail}</td>
                 <td className="px-3 py-2 text-blue-600 cursor-pointer">操作</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-slate-500 px-2 flex justify-center gap-2 items-center">
         <span>共 0 条</span>
         <select className="border text-xs"><option>10条/页</option></select>
         <button className="border px-2 py-0.5 bg-blue-500 text-white rounded">1</button>
         <button className="border px-2 py-0.5 rounded">{'>'}</button>
         <span>前往 <input className="w-8 border text-center"/> 页</span>
       </div>
    </div>
  );
};

// 6. 单库视图
const OrderLibraryView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateOrderLibraryData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-2">
         <DataOverview items={[{ label: '总单数', value: 398 }, { label: '有效单', value: 390 }]} />
      </div>
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}>
         <div className="grid grid-cols-7 gap-3">
             <div className="flex items-center gap-2 col-span-2"><span className="text-xs text-slate-500 whitespace-nowrap">订单号/手机号</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">分机号</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">创建人</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">录单人</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">地域</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">地址</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">来源</span><select className="h-7 w-full border border-blue-200 rounded px-2 text-xs"><option>请选择</option></select></div>
             <div className="flex items-center gap-2 col-span-2"><span className="text-xs text-slate-500 whitespace-nowrap">报名时间</span><input type="date" className="h-7 w-full border border-blue-200 rounded px-2 text-xs" /><span className="text-xs">-</span><input type="date" className="h-7 w-full border border-blue-200 rounded px-2 text-xs" /></div>
             <div className="col-span-1 flex gap-2">
                <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs w-full">搜索</button>
                <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs w-full">重置</button>
             </div>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr>
              {['序号','是否有效','是否可视','是否派打','录单时间','报名时间','状态','地域','详细地址','详情','来源','工作机','录单员','派单员','师傅','师傅id','作废时间','作废原因','撤销原因','撤销时间','派单时间','总收款','成本','业绩','实付金额','垫付金额','备注','完工收入','客服备注','操作'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {data.map((row, i) => (
               <tr key={row.id} className="hover:bg-blue-50">
                 <td className="px-3 py-2 text-center">{row.id}</td>
                 <td className="px-3 py-2">{row.isValid}</td>
                 <td className="px-3 py-2">{row.isVisible}</td>
                 <td className="px-3 py-2">{row.isCalled}</td>
                 <td className="px-3 py-2 whitespace-nowrap">{row.recordTime}</td>
                 <td className="px-3 py-2 whitespace-nowrap">{row.signupTime}</td>
                 <td className="px-3 py-2">{row.status}</td>
                 <td className="px-3 py-2">{row.region}</td>
                 <td className="px-3 py-2 max-w-[100px] truncate" title={row.address}>{row.address}</td>
                 <td className="px-3 py-2 max-w-[100px] truncate" title={row.detail}>{row.detail}</td>
                 <td className="px-3 py-2">{row.source}</td>
                 <td className="px-3 py-2">{row.workPhone}</td>
                 <td className="px-3 py-2">{row.recorder}</td>
                 <td className="px-3 py-2">{row.dispatcher}</td>
                 <td className="px-3 py-2">{row.master}</td>
                 <td className="px-3 py-2">{row.masterId}</td>
                 <td className="px-3 py-2">{row.voidTime}</td>
                 <td className="px-3 py-2">{row.voidReason}</td>
                 <td className="px-3 py-2">{row.revokeReason}</td>
                 <td className="px-3 py-2">{row.revokeTime}</td>
                 <td className="px-3 py-2 whitespace-nowrap">{row.dispatchTime}</td>
                 <td className="px-3 py-2">{row.total}</td>
                 <td className="px-3 py-2">{row.cost}</td>
                 <td className="px-3 py-2">{row.revenue}</td>
                 <td className="px-3 py-2">{row.paid}</td>
                 <td className="px-3 py-2">{row.deposit}</td>
                 <td className="px-3 py-2">{row.remark}</td>
                 <td className="px-3 py-2">{row.finishIncome}</td>
                 <td className="px-3 py-2">{row.csRemark}</td>
                 <td className="px-3 py-2 text-blue-600 cursor-pointer">详情</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-slate-500 px-2 flex justify-center gap-2 items-center">
         <span>共 0 条</span>
         <select className="border text-xs"><option>10条/页</option></select>
         <button className="border px-2 py-0.5 bg-blue-500 text-white rounded">1</button>
         <button className="border px-2 py-0.5 rounded">{'>'}</button>
         <span>前往 <input className="w-8 border text-center"/> 页</span>
       </div>
    </div>
  );
};

// 7. 微信收款视图
const WeChatCollectionView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateWeChatCollectionData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-2">
         <DataOverview items={[{ label: '微信总收款', value: '¥ 12300.00' }, { label: '线下总收款', value: '¥ 5000.00' }]} />
      </div>
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)} extraButtons={<button className="bg-green-600 text-white px-3 py-1 text-xs rounded">微信对账</button>}>
         <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">创建时间</span><input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs" /> <span className="text-xs">-</span> <input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs" /></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs">重置</button>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr>
              {['序号','派单员','微信总收款','线下派单线下总收款','其它收款'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {data.map((row, i) => (
               <tr key={row.id} className="hover:bg-blue-50">
                 <td className="px-3 py-2 text-center">{row.id}</td>
                 <td className="px-3 py-2">{row.dispatcher}</td>
                 <td className="px-3 py-2 font-bold text-orange-600">{row.wechatTotal}</td>
                 <td className="px-3 py-2">{row.offlineTotal}</td>
                 <td className="px-3 py-2">{row.otherTotal}</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 1. 订单收款视图
const OrderPaymentView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generatePaymentData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}>
         <div className="flex flex-wrap gap-3 items-center">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">订单号/手机号</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">派单员</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-24" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">核销券</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-24" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">收款记录时间</span><input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs" /> <span className="text-xs">-</span> <input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">收款方式</span><select className="h-7 border border-blue-200 rounded px-2 text-xs w-24"><option>请选择</option></select></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">派单类型</span><select className="h-7 border border-blue-200 rounded px-2 text-xs w-24"><option>请选择</option></select></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">验券时间</span><input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs" /> <span className="text-xs">-</span> <input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">验券状态</span><select className="h-7 border border-blue-200 rounded px-2 text-xs w-24"><option>请选择</option></select></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs ml-auto">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs">重置</button>
         </div>
      </FilterContainer>
      
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr>
              {['序号','订单号','派单员','完成时间','收款记录时间','手机号','收款金额','收款方式','核销券','验券状态','门店名称','验券金额','验券时间','验券失败原因','备注','创建人'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {data.map((row, i) => (
               <tr key={row.id} className="hover:bg-blue-50">
                 <td className="px-3 py-2 text-center">{row.id}</td>
                 <td className="px-3 py-2 text-blue-600">{row.orderNo}</td>
                 <td className="px-3 py-2">{row.dispatcher}</td>
                 <td className="px-3 py-2">{row.finishTime}</td>
                 <td className="px-3 py-2">{row.payRecordTime}</td>
                 <td className="px-3 py-2">{row.mobile}</td>
                 <td className="px-3 py-2 font-bold text-orange-600">¥{row.amount}</td>
                 <td className="px-3 py-2">{row.method}</td>
                 <td className="px-3 py-2 text-center">{row.coupon}</td>
                 <td className="px-3 py-2 text-center">{row.verifyStatus === '已核销' ? <span className="text-green-600">已核销</span> : <span className="text-gray-400">未核销</span>}</td>
                 <td className="px-3 py-2">{row.storeName}</td>
                 <td className="px-3 py-2">{row.verifyAmount}</td>
                 <td className="px-3 py-2">{row.verifyTime}</td>
                 <td className="px-3 py-2 text-center">{row.failReason}</td>
                 <td className="px-3 py-2">{row.remark}</td>
                 <td className="px-3 py-2">{row.creator}</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
       <div className="mt-2 text-xs font-bold text-slate-700 px-2">收款合计: ¥ 2450.00 &nbsp;&nbsp; 订单总数 (已去重): 20</div>
    </div>
  );
};

// 2. 报错订单视图
const ErrorOrderView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateErrorData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-2">
        <DataOverview items={[
          { label: '订单总数', value: 20 },
          { label: '待处理', value: 5 },
          { label: '处理中', value: 10 },
          { label: '已解决', value: 5 }
        ]} />
      </div>
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)} extraButtons={<button className="bg-blue-600 text-white px-3 py-1 text-xs rounded">一键导出</button>}>
         <div className="grid grid-cols-6 gap-3">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">订单号/手机号</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">录单人</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">派单员</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" /></div>
             <div className="flex items-center gap-2 col-span-2"><span className="text-xs text-slate-500 whitespace-nowrap">报错发起时间</span><input type="date" className="h-7 w-full border border-blue-200 rounded px-2 text-xs" /><span className="text-xs">-</span><input type="date" className="h-7 w-full border border-blue-200 rounded px-2 text-xs" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">状态</span><select className="h-7 w-full border border-blue-200 rounded px-2 text-xs"><option>请选择</option></select></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">报错类型</span><select className="h-7 w-full border border-blue-200 rounded px-2 text-xs"><option>请选择</option></select></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">订单来源</span><select className="h-7 w-full border border-blue-200 rounded px-2 text-xs"><option>请选择</option></select></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap">工作机</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs" /></div>
             <div className="col-span-1 flex gap-2">
                <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs w-full">搜索</button>
                <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs w-full">重置</button>
             </div>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr>
              {['序号','订单号','提出报错时间','手机号','来源','工作机','客户名单','状态','录单人','师傅','派单人','报错提出人','报错类型','报错详情','处理详情','处理时间','解决方案','解决人','解决时间','操作'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {data.map((row, i) => (
               <tr key={row.id} className="hover:bg-blue-50">
                 <td className="px-3 py-2 text-center">{row.id}</td>
                 <td className="px-3 py-2 text-blue-600">{row.orderNo}</td>
                 <td className="px-3 py-2 whitespace-nowrap">{row.reportTime}</td>
                 <td className="px-3 py-2">{row.mobile}</td>
                 <td className="px-3 py-2">{row.source}</td>
                 <td className="px-3 py-2">{row.workPhone}</td>
                 <td className="px-3 py-2">{row.clientName}</td>
                 <td className="px-3 py-2 text-center"><span className="bg-red-50 text-red-500 border border-red-200 px-1 rounded">{row.status}</span></td>
                 <td className="px-3 py-2">{row.recorder}</td>
                 <td className="px-3 py-2">{row.master}</td>
                 <td className="px-3 py-2">{row.dispatcher}</td>
                 <td className="px-3 py-2">{row.reporter}</td>
                 <td className="px-3 py-2">{row.type}</td>
                 <td className="px-3 py-2 max-w-[100px] truncate" title={row.detail}>{row.detail}</td>
                 <td className="px-3 py-2 max-w-[100px] truncate" title={row.processDetail}>{row.processDetail}</td>
                 <td className="px-3 py-2 whitespace-nowrap">{row.processTime}</td>
                 <td className="px-3 py-2">{row.solution}</td>
                 <td className="px-3 py-2">{row.solver}</td>
                 <td className="px-3 py-2 whitespace-nowrap">{row.solveTime}</td>
                 <td className="px-3 py-2 text-blue-600 cursor-pointer whitespace-nowrap">详情 修改 解决</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-slate-500 px-2 flex justify-end">共 20 条</div>
    </div>
  );
};

// 3. 直派订单视图
const DirectDispatchView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateDirectDispatchData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)} extraButtons={<div className="flex gap-2"><button className="bg-blue-600 text-white px-3 py-1 text-xs rounded">充值</button><button className="bg-blue-400 text-white px-3 py-1 text-xs rounded">一键导出</button></div>}>
         <div className="flex flex-wrap gap-3 items-center">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">订单号/第三方客户名称</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">分机号</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-24" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">创建人</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-24" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">报名时间</span><input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">状态</span><select className="h-7 border border-blue-200 rounded px-2 text-xs w-24"><option>请选择</option></select></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">来源</span><select className="h-7 border border-blue-200 rounded px-2 text-xs w-24"><option>请选择</option></select></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs ml-auto">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs">重置</button>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr>
              {['序号','商家名称','商家订单号','订单号','订单状态','地域','详细地址','详情','来源','工作机','客户名单','师傅','订单创建人','师傅id','创建人id','操作时间','取消原因','取消详情','录单时间','接单时间','总金额','成本','业绩','实付金额','垫付金额','剩余尾款','备注','完工收入','客户地图','操作'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {data.map((row, i) => (
               <tr key={row.id} className="hover:bg-blue-50">
                 <td className="px-3 py-2 text-center">{row.id}</td>
                 <td className="px-3 py-2">{row.merchant}</td>
                 <td className="px-3 py-2">{row.merchantOrderNo}</td>
                 <td className="px-3 py-2 text-blue-600">{row.orderNo}</td>
                 <td className="px-3 py-2">{row.status}</td>
                 <td className="px-3 py-2 whitespace-nowrap">{row.region}</td>
                 <td className="px-3 py-2 max-w-[150px] truncate">{row.address}</td>
                 <td className="px-3 py-2">{row.detail}</td>
                 <td className="px-3 py-2">{row.source}</td>
                 <td className="px-3 py-2">{row.workPhone}</td>
                 <td className="px-3 py-2">{row.clientName}</td>
                 <td className="px-3 py-2">{row.master}</td>
                 <td className="px-3 py-2">{row.creator}</td>
                 <td className="px-3 py-2">{row.masterId}</td>
                 <td className="px-3 py-2">{row.creatorId}</td>
                 <td className="px-3 py-2 whitespace-nowrap">{row.opTime}</td>
                 <td className="px-3 py-2">{row.cancelReason}</td>
                 <td className="px-3 py-2">{row.cancelTime}</td>
                 <td className="px-3 py-2 whitespace-nowrap">{row.recordTime}</td>
                 <td className="px-3 py-2 whitespace-nowrap">{row.receiveTime}</td>
                 <td className="px-3 py-2">{row.total}</td>
                 <td className="px-3 py-2">{row.cost}</td>
                 <td className="px-3 py-2">{row.revenue}</td>
                 <td className="px-3 py-2">{row.paid}</td>
                 <td className="px-3 py-2">{row.deposit}</td>
                 <td className="px-3 py-2">{row.rest}</td>
                 <td className="px-3 py-2">{row.remark}</td>
                 <td className="px-3 py-2">{row.finishIncome}</td>
                 <td className="px-3 py-2 text-blue-600 cursor-pointer">{row.map}</td>
                 <td className="px-3 py-2 text-blue-600 cursor-pointer">详情 修改</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
       <div className="mt-2 text-xs text-slate-500 px-2 flex justify-center gap-2">
         <button className="border px-2 py-0.5 rounded">1</button>
         <span>...</span>
         <span className="text-slate-400">共 1 页</span>
       </div>
    </div>
  );
};

// 4. 派单业绩视图
const DispatchPerformanceView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generatePerformanceData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}>
         <div className="flex flex-wrap gap-4 items-center">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">派单员</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">完成时间</span><input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs" /> <span className="text-xs">-</span> <input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">收款时间</span><input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs" /> <span className="text-xs">-</span> <input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs" /></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs">重置</button>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr>
              <th className="px-3 py-2 font-medium text-slate-700">序号</th>
              <th className="px-3 py-2 font-medium text-slate-700">派单员</th>
              <th className="px-3 py-2 font-medium text-slate-700">总业绩</th>
              <th className="px-3 py-2 font-medium text-slate-700">手动派单线下业绩</th>
              <th className="px-3 py-2 font-medium text-slate-700">手动派单平台业绩</th>
              <th className="px-3 py-2 font-medium text-slate-700">手动派单总业绩</th>
              <th className="px-3 py-2 font-medium text-slate-700">自动派单线下业绩</th>
              <th className="px-3 py-2 font-medium text-slate-700">自动派单平台业绩</th>
              <th className="px-3 py-2 font-medium text-slate-700">自动派单总业绩</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {data.map((row, i) => (
               <tr key={row.id} className="hover:bg-blue-50">
                 <td className="px-3 py-2 text-center">{row.id}</td>
                 <td className="px-3 py-2">{row.dispatcher}</td>
                 <td className="px-3 py-2 text-orange-600 font-bold">{row.total}</td>
                 <td className="px-3 py-2">{row.manualOffline}</td>
                 <td className="px-3 py-2">{row.manualPlatform}</td>
                 <td className="px-3 py-2">{row.manualTotal}</td>
                 <td className="px-3 py-2">{row.autoOffline}</td>
                 <td className="px-3 py-2">{row.autoPlatform}</td>
                 <td className="px-3 py-2">{row.autoTotal}</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 5. 改单记录视图
const ChangeRecordView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateChangeData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-2">
        <DataOverview items={[{ label: '记录总数', value: 20 }, { label: '今日新增', value: 5 }]} />
      </div>
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}>
         <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">订单号/手机号</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-48" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">操作人员</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32" placeholder="请输入内容" /></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs">重置</button>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr>
              <th className="px-3 py-2 font-medium text-slate-700">序号</th>
              <th className="px-3 py-2 font-medium text-slate-700">编号</th>
              <th className="px-3 py-2 font-medium text-slate-700">订单号</th>
              <th className="px-3 py-2 font-medium text-slate-700">更新时间</th>
              <th className="px-3 py-2 font-medium text-slate-700">手机号</th>
              <th className="px-3 py-2 font-medium text-slate-700">操作人员</th>
              <th className="px-3 py-2 font-medium text-slate-700">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {data.map((row, i) => (
               <tr key={row.id} className="hover:bg-blue-50">
                 <td className="px-3 py-2 text-center">{row.id}</td>
                 <td className="px-3 py-2 text-center">{row.seq}</td>
                 <td className="px-3 py-2">{row.orderNo}</td>
                 <td className="px-3 py-2">{row.updateTime}</td>
                 <td className="px-3 py-2">{row.mobile}</td>
                 <td className="px-3 py-2">{row.operator}</td>
                 <td className="px-3 py-2 text-blue-600 cursor-pointer">查看详情</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-slate-500 px-2 flex justify-center gap-2 items-center">
         <span>共 20 条</span>
         <select className="border text-xs"><option>10条/页</option></select>
         <button className="border px-2 py-0.5 bg-blue-500 text-white rounded">1</button>
         <button className="border px-2 py-0.5 rounded">2</button>
         <button className="border px-2 py-0.5 rounded">3</button>
         <span>...</span>
         <button className="border px-2 py-0.5 rounded">24</button>
         <button className="border px-2 py-0.5 rounded">{'>'}</button>
         <span>前往 <input className="w-8 border text-center"/> 页</span>
       </div>
    </div>
  );
};

// 6. 长期订单视图
const LongTermOrderView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateLongTermData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-2">
         <DataOverview items={[{ label: '长期订单总数', value: 20 }, { label: '待处理', value: 4 }]} />
      </div>
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}>
         <div className="flex flex-wrap gap-4 items-center">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">订单号</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">师傅</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">状态</span><select className="h-7 border border-blue-200 rounded px-2 text-xs w-24"><option>请选择</option></select></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500">创建时间</span><input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs" /> <span className="text-xs">-</span> <input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs" /></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs">重置</button>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr>
              {['序号','订单号','手机号','客户名称','状态','师傅','录单人','派单人','创建时间','原因','佐证材料'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {data.map((row, i) => (
               <tr key={row.id} className="hover:bg-blue-50">
                 <td className="px-3 py-2 text-center">{row.id}</td>
                 <td className="px-3 py-2">{row.orderNo}</td>
                 <td className="px-3 py-2">{row.mobile}</td>
                 <td className="px-3 py-2">{row.clientName}</td>
                 <td className="px-3 py-2">{row.status}</td>
                 <td className="px-3 py-2">{row.master}</td>
                 <td className="px-3 py-2">{row.recorder}</td>
                 <td className="px-3 py-2">{row.dispatcher}</td>
                 <td className="px-3 py-2 whitespace-nowrap">{row.createTime}</td>
                 <td className="px-3 py-2">{row.reason}</td>
                 <td className="px-3 py-2 text-blue-600 cursor-pointer flex items-center gap-1">
                   {row.material}
                   {i%2===0 && <span className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{i%3+1}</span>}
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-slate-500 px-2 flex justify-center gap-2 items-center">
         <span>共 20 条</span>
         <select className="border text-xs"><option>10条/页</option></select>
         <button className="border px-2 py-0.5 bg-blue-500 text-white rounded">1</button>
         <button className="border px-2 py-0.5 rounded">2</button>
         <button className="border px-2 py-0.5 rounded">3</button>
         <span>...</span>
         <button className="border px-2 py-0.5 rounded">9</button>
         <button className="border px-2 py-0.5 rounded">{'>'}</button>
         <span>前往 <input className="w-8 border text-center"/> 页</span>
       </div>
    </div>
  );
};

// --- 工具组件 ---

const TooltipCell = ({ content, maxWidthClass, showTooltip }: { content: string, maxWidthClass: string, showTooltip: boolean }) => (
  <div className={`relative group cursor-pointer ${maxWidthClass}`}>
    <div className="truncate text-xs text-slate-700">{content}</div>
    {showTooltip && (
      <div className="absolute z-50 bg-slate-800 text-white text-xs p-2 rounded shadow-lg -top-8 left-0 whitespace-nowrap">
        {content}
      </div>
    )}
  </div>
);

// --- Missing Components ---

const ActionBar = ({ 
  onRecord, 
  isSearchOpen, 
  onToggleSearch 
}: { 
  onRecord: () => void; 
  isSearchOpen: boolean; 
  onToggleSearch: () => void;
}) => {
  return (
    <div className="flex items-center justify-between mb-3 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
      <div className="flex gap-2">
        <button onClick={onRecord} className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded shadow hover:shadow-md transition-all active:scale-95 text-xs font-bold">
          <Plus size={16} /> 录单
        </button>
        <button className="flex items-center gap-1 bg-white border border-gray-200 text-slate-700 px-3 py-2 rounded hover:bg-gray-50 transition-colors text-xs font-medium">
          <Upload size={14} /> 导入
        </button>
        <button className="flex items-center gap-1 bg-white border border-gray-200 text-slate-700 px-3 py-2 rounded hover:bg-gray-50 transition-colors text-xs font-medium">
          <FileText size={14} /> 导出
        </button>
      </div>
      <button 
        onClick={onToggleSearch}
        className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-medium transition-all
          ${isSearchOpen ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
      >
        <Search size={14} />
        {isSearchOpen ? '收起筛选' : '高级筛选'}
        {isSearchOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
    </div>
  );
};

const SearchPanel = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="bg-[#F0F7FF] border border-blue-200 rounded-lg p-3 mb-3 shadow-sm animate-in fade-in slide-in-from-top-2">
      <div className="flex flex-wrap gap-y-3 items-center">
        {/* Row 1 */}
        <div className="flex items-center mr-4">
           <label className="text-xs font-bold text-slate-600 w-12 text-right mr-2">关键词</label>
           <input className="w-32 h-8 border border-gray-300 rounded px-2 text-xs focus:border-blue-500 outline-none" placeholder="订单号/手机/客户..." />
        </div>
        <div className="flex items-center mr-4">
           <label className="text-xs font-bold text-slate-600 w-8 text-right mr-2">分机</label>
           <input className="w-24 h-8 border border-gray-300 rounded px-2 text-xs focus:border-blue-500 outline-none" placeholder="请输入..." />
        </div>
        <div className="flex items-center mr-4">
           <label className="text-xs font-bold text-slate-600 w-12 text-right mr-2">创建人</label>
           <input className="w-24 h-8 border border-gray-300 rounded px-2 text-xs focus:border-blue-500 outline-none" placeholder="请输入..." />
        </div>
        <div className="flex items-center mr-4">
           <label className="text-xs font-bold text-slate-600 w-8 text-right mr-2">项目</label>
           <input className="w-24 h-8 border border-gray-300 rounded px-2 text-xs focus:border-blue-500 outline-none" placeholder="服务项目..." />
        </div>
        <div className="flex items-center mr-4">
           <label className="text-xs font-bold text-slate-600 w-8 text-right mr-2">地域</label>
           <input className="w-24 h-8 border border-gray-300 rounded px-2 text-xs focus:border-blue-500 outline-none" placeholder="请输入..." />
        </div>
        <div className="flex items-center mr-4">
           <label className="text-xs font-bold text-slate-600 w-8 text-right mr-2">状态</label>
           <select className="w-24 h-8 border border-gray-300 rounded px-2 text-xs focus:border-blue-500 outline-none bg-white">
             <option>全部</option>
             <option>待派单</option>
             <option>已完成</option>
             <option>作废</option>
           </select>
        </div>
        <div className="flex items-center mr-4">
           <label className="text-xs font-bold text-slate-600 w-8 text-right mr-2">来源</label>
           <select className="w-24 h-8 border border-gray-300 rounded px-2 text-xs focus:border-blue-500 outline-none bg-white">
             <option>全部</option>
             <option>美团</option>
             <option>58同城</option>
           </select>
        </div>
        <div className="flex items-center mr-4">
           <label className="text-xs font-bold text-slate-600 w-8 text-right mr-2">方式</label>
           <select className="w-24 h-8 border border-gray-300 rounded px-2 text-xs focus:border-blue-500 outline-none bg-white">
             <option>全部</option>
           </select>
        </div>
        <div className="flex items-center">
           <label className="text-xs font-bold text-slate-600 w-8 text-right mr-2">补款</label>
           <select className="w-24 h-8 border border-gray-300 rounded px-2 text-xs focus:border-blue-500 outline-none bg-white">
             <option>全部</option>
           </select>
        </div>

        {/* Row 2 */}
        <div className="w-full h-0"></div> {/* Force break */}

        <div className="flex items-center mr-4">
           <label className="text-xs font-bold text-slate-600 w-12 text-right mr-2">工作机</label>
           <input className="w-32 h-8 border border-gray-300 rounded px-2 text-xs focus:border-blue-500 outline-none" placeholder="请输入..." />
        </div>
        <div className="flex items-center mr-4">
           <label className="text-xs font-bold text-slate-600 w-10 text-right mr-2">派单员</label>
           <input className="w-24 h-8 border border-gray-300 rounded px-2 text-xs focus:border-blue-500 outline-none" placeholder="请输入..." />
        </div>
        <div className="flex items-center mr-4">
           <label className="text-xs font-bold text-slate-600 w-8 text-right mr-2">师傅</label>
           <input className="w-24 h-8 border border-gray-300 rounded px-2 text-xs focus:border-blue-500 outline-none" placeholder="请输入..." />
        </div>
        <div className="flex items-center mr-4">
           <label className="text-xs font-bold text-slate-600 w-20 text-right mr-2">线下师傅手机</label>
           <input className="w-24 h-8 border border-gray-300 rounded px-2 text-xs focus:border-blue-500 outline-none" placeholder="请输入..." />
        </div>
        <div className="flex items-center mr-4">
           <label className="text-xs font-bold text-slate-600 w-8 text-right mr-2">比例</label>
           <input className="w-24 h-8 border border-gray-300 rounded px-2 text-xs focus:border-blue-500 outline-none" placeholder="请输入..." />
        </div>
        
        {/* Date Group with attached select */}
        <div className="flex items-center mr-4">
           <div className="flex rounded border border-gray-300 bg-white overflow-hidden h-8">
             <select className="h-full px-2 text-xs focus:outline-none bg-white border-r border-gray-200 text-slate-700 font-bold min-w-[80px]">
               <option>创建时间</option>
               <option>完成时间</option>
               <option>收款时间</option>
               <option>服务时间</option>
             </select>
             <div className="flex items-center px-2">
                <Calendar size={14} className="text-slate-400 mr-2" />
                <input type="text" className="w-28 text-xs outline-none text-slate-600" placeholder="年 / 月 / 日 --:--" />
                <span className="text-slate-400 mx-1">-</span>
                <input type="text" className="w-28 text-xs outline-none text-slate-600" placeholder="年 / 月 / 日 --:--" />
             </div>
           </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 ml-auto">
           <button className="px-4 h-8 bg-white border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors">重置</button>
           <button className="px-5 h-8 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1 shadow-sm shadow-blue-200 transition-colors">
             <Search size={13} />
             搜索
           </button>
        </div>
      </div>
    </div>
  );
};

const ServiceItemCell = ({ item, warranty }: { item: string; warranty: string }) => (
  <div className="flex flex-col">
    <span className="font-bold text-slate-800 text-[13px]">{item}</span>
    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
       <CheckCircle size={10} /> 质保: {warranty}
    </span>
  </div>
);

const StatusCell = ({ order }: { order: Order }) => {
  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PendingDispatch: return 'bg-orange-50 text-orange-600 border-orange-100';
      case OrderStatus.Completed: return 'bg-green-50 text-green-600 border-green-100';
      case OrderStatus.Void: return 'bg-gray-100 text-gray-500 border-gray-200';
      case OrderStatus.Returned: return 'bg-red-50 text-red-600 border-red-100';
      case OrderStatus.Error: return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      default: return 'bg-slate-50 text-slate-600';
    }
  };
  return (
    <div className={`px-2 py-1 rounded border text-[11px] font-bold text-center whitespace-nowrap ${getStatusStyle(order.status)}`}>
      {order.status}
    </div>
  );
};

const CombinedIdCell = ({ orderNo, workOrderNo, hasAdvancePayment, depositAmount }: { orderNo: string; workOrderNo: string; hasAdvancePayment: boolean; depositAmount?: number }) => (
  <div className="flex flex-col gap-0.5">
    <div className="flex items-center gap-1">
      <span className="text-blue-600 font-medium text-[11px] cursor-pointer hover:underline" title="点击复制">{orderNo}</span>
      <Copy size={10} className="text-slate-300 cursor-pointer hover:text-blue-500" />
    </div>
    <div className="text-[10px] text-slate-400">{workOrderNo}</div>
    {hasAdvancePayment && (
      <div className="flex items-center gap-1 mt-0.5">
         <span className="bg-red-50 text-red-600 border border-red-100 text-[9px] px-1 rounded">垫</span>
         {depositAmount && <span className="text-[9px] text-slate-500">¥{depositAmount}</span>}
      </div>
    )}
  </div>
);

const CombinedTimeCell = ({ recordTime, dispatchTime }: { recordTime: string; dispatchTime: string }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1 text-[10px] text-slate-500" title="录单时间">
      <Clock size={10} /> {recordTime.split(' ')[1]}
    </div>
    <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium bg-blue-50 px-1 rounded w-fit" title="上门时间">
      <Calendar size={10} /> {dispatchTime.split(' ')[0]}
    </div>
  </div>
);

const ReminderCell = ({ order, onRemind }: { order: Order; onRemind: (id: number) => void }) => (
  <button 
    onClick={() => !order.isReminded && onRemind(order.id)}
    className={`flex items-center justify-center w-full py-1 rounded transition-all ${order.isReminded ? 'text-gray-300 cursor-not-allowed' : 'text-orange-500 hover:bg-orange-50'}`}
    disabled={order.isReminded}
  >
    <Bell size={16} className={order.isReminded ? '' : 'animate-pulse'} />
  </button>
);

const ActionCell = ({ orderId, onAction }: { orderId: number; onAction: (action: string, id: number) => void }) => (
  <div className="relative group flex justify-center">
    <button className="text-slate-400 hover:text-blue-600 p-1">
      <Settings size={16} />
    </button>
    {/* Simple Dropdown on hover */}
    <div className="absolute right-0 top-6 hidden group-hover:block bg-white border border-gray-200 shadow-xl rounded z-50 w-24 py-1">
      <button onClick={() => onAction('详情', orderId)} className="block w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600">详情</button>
      <button onClick={() => onAction('完单', orderId)} className="block w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600">完单</button>
      <button onClick={() => onAction('作废', orderId)} className="block w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">作废</button>
    </div>
  </div>
);

const Pagination = ({ total, current, pageSize, onPageChange, onSizeChange }: any) => {
  const totalPages = Math.ceil(total / pageSize);

  // A simple way to handle page range to match the screenshot style (1 2 3 4 5 6 7)
  const getPageRange = () => {
      const pages = [];
      const maxVisible = 7;
      let start = Math.max(1, current - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
          start = Math.max(1, end - maxVisible + 1);
      }

      for(let i=start; i<=end; i++) pages.push(i);
      return pages;
  };

  return (
    <div className="flex items-center text-sm text-slate-500 select-none">
      <span className="mr-3 text-slate-600 text-xs">共 {total} 条</span>
      
      <div className="relative mr-3">
         <select 
            value={pageSize} 
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="appearance-none h-8 pl-3 pr-8 border border-slate-300 rounded hover:border-blue-400 focus:border-blue-500 outline-none bg-white cursor-pointer text-slate-600 text-xs font-medium"
         >
           <option value={10}>10条/页</option>
           <option value={20}>20条/页</option>
           <option value={50}>50条/页</option>
         </select>
         <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      
      <div className="flex items-center gap-1.5 mr-3">
         <button 
           onClick={() => onPageChange(Math.max(1, current - 1))}
           disabled={current === 1}
           className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded bg-white text-slate-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
         >
           <ChevronLeft size={16} strokeWidth={1.5} />
         </button>

         {getPageRange().map(p => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 flex items-center justify-center border rounded transition-colors font-medium text-xs
                ${current === p 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                  : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                }`}
            >
              {p}
            </button>
         ))}

         <button 
           onClick={() => onPageChange(Math.min(totalPages, current + 1))}
           disabled={current === totalPages}
           className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded bg-white text-slate-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
         >
           <ChevronRight size={16} strokeWidth={1.5} />
         </button>
      </div>

      <div className="flex items-center gap-2 text-xs">
         <span className="text-slate-600">前往</span>
         <input 
           type="text"
           className="w-10 h-8 border border-slate-300 rounded text-center outline-none focus:border-blue-500 hover:border-blue-400 text-slate-600"
           defaultValue={current}
           key={current} // force re-render on external change
           onBlur={(e) => {
             const val = parseInt(e.target.value);
             if(!isNaN(val) && val >=1 && val <= totalPages) {
                onPageChange(val);
             } else {
                e.target.value = current.toString();
             }
           }}
           onKeyDown={(e) => {
             if(e.key === 'Enter') {
                const val = parseInt(e.currentTarget.value);
                if(!isNaN(val) && val >=1 && val <= totalPages) {
                    onPageChange(val);
                }
             }
           }}
         />
         <span className="text-slate-600">页</span>
      </div>
    </div>
  );
};

const ModalOverlay = ({ children, onClose }: { children?: React.ReactNode; onClose: () => void }) => {
  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white rounded-xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-auto">
        {children}
      </div>
    </div>,
    document.body
  );
};

const RecordOrderModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-[600px] p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">录入新订单</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
           {/* Simple placeholders for the form */}
           <div className="col-span-2"><label className="block text-xs font-medium text-slate-500 mb-1">客户手机</label><input className="w-full border p-2 rounded text-sm"/></div>
           <div><label className="block text-xs font-medium text-slate-500 mb-1">服务项目</label><input className="w-full border p-2 rounded text-sm"/></div>
           <div><label className="block text-xs font-medium text-slate-500 mb-1">预约时间</label><input type="datetime-local" className="w-full border p-2 rounded text-sm"/></div>
           <div className="col-span-2"><label className="block text-xs font-medium text-slate-500 mb-1">详细地址</label><textarea className="w-full border p-2 rounded text-sm h-20"/></div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
           <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded">取消</button>
           <button onClick={onClose} className="px-6 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">确认录入</button>
        </div>
      </div>
    </ModalOverlay>
  );
};

const CompleteOrderModal = ({ isOpen, onClose, order }: { isOpen: boolean; onClose: () => void; order: Order | null }) => {
  if (!isOpen) return null;
  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-[500px] p-6">
         <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">订单完结结算</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <div className="bg-slate-50 p-3 rounded mb-4 text-sm text-slate-700">
           当前订单：<span className="font-bold">{order?.orderNo}</span>
        </div>
        <div className="space-y-4">
           <div><label className="block text-xs font-medium text-slate-500 mb-1">实际收款金额</label><div className="relative"><span className="absolute left-3 top-2 text-slate-500">¥</span><input className="w-full border pl-6 p-2 rounded text-sm font-bold text-orange-600" defaultValue={order?.totalAmount} /></div></div>
           <div><label className="block text-xs font-medium text-slate-500 mb-1">完工备注</label><textarea className="w-full border p-2 rounded text-sm h-20"/></div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
           <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded">取消</button>
           <button onClick={onClose} className="px-6 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-medium">确认完工</button>
        </div>
      </div>
    </ModalOverlay>
  );
};

const ChatModal = ({ isOpen, onClose, role, order }: { isOpen: boolean; onClose: () => void; role: string; order: Order | null }) => {
  if (!isOpen) return null;
  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-[400px] h-[600px] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-slate-50 rounded-t-xl">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><MessageCircle size={16}/></div>
             <div>
               <div className="text-sm font-bold text-slate-800">联系{role}</div>
               <div className="text-[10px] text-slate-500">订单: {order?.orderNo}</div>
             </div>
           </div>
           <button onClick={onClose}><X size={18} className="text-slate-400"/></button>
        </div>
        <div className="flex-1 bg-white p-4 overflow-y-auto space-y-3">
           <div className="flex justify-center"><span className="text-[10px] text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full">今天 10:23</span></div>
           <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0"/>
              <div className="bg-slate-100 p-2 rounded-tr-xl rounded-br-xl rounded-bl-xl text-xs text-slate-700 max-w-[80%]">你好，请问这个订单有什么问题吗？</div>
           </div>
           <div className="flex gap-2 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0"/>
              <div className="bg-blue-600 text-white p-2 rounded-tl-xl rounded-br-xl rounded-bl-xl text-xs max-w-[80%]">师傅说客户电话打不通，麻烦核实一下。</div>
           </div>
        </div>
        <div className="p-3 border-t">
           <div className="flex gap-2">
             <input className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500" placeholder="发送消息..." />
             <button className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"><Send size={16}/></button>
           </div>
        </div>
      </div>
    </ModalOverlay>
  );
};

// --- 完整的 App 组件 ---
const App = () => {
  const [activeTab, setActiveTab] = useState('订单管理');
  
  // 仅在“订单管理”Tab 使用的状态
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false); 
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(FULL_MOCK_DATA);
  const [chatState, setChatState] = useState<{isOpen: boolean; role: string; order: Order | null;}>({ isOpen: false, role: '', order: null });
  const [hoveredTooltipCell, setHoveredTooltipCell] = useState<{rowId: number, colKey: 'address' | 'details' | 'service'} | null>(null);

  // 原始的订单管理 Tab 处理函数
  const handleRemindOrder = (id: number) => {
     setOrders(prevOrders => prevOrders.map(order => 
        order.id === id ? { ...order, isReminded: true } : order
     ));
  };
  
  const sortedData = [...orders].sort((a, b) => {
    const aIsPending = a.status === OrderStatus.PendingDispatch;
    const bIsPending = b.status === OrderStatus.PendingDispatch;
    if (aIsPending && !bIsPending) return -1;
    if (!aIsPending && bIsPending) return 1;
    if (a.isReminded !== b.isReminded) return a.isReminded ? 1 : -1;
    return 0;
  });

  const totalItems = sortedData.length;
  const currentData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAction = (action: string, id: number) => {
    const order = sortedData.find(o => o.id === id);
    if (!order) return;
    if (action === '完单') { setCurrentOrder(order); setCompleteModalOpen(true); } 
    else { alert(`已执行操作：${action} (订单ID: ${id})`); }
  };

  const handleOpenChat = (role: string, order: Order) => { setChatState({ isOpen: true, role, order }); };
  const handleMouseEnterOther = () => { setHoveredTooltipCell(null); };

  // --- 视图渲染路由 ---
  const renderContent = () => {
    switch (activeTab) {
      case '订单管理':
        return (
          <>
            <ActionBar 
              onRecord={() => setIsRecordModalOpen(true)} 
              isSearchOpen={isSearchOpen}
              onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
            />
            <SearchPanel isOpen={isSearchOpen} onToggle={() => setIsSearchOpen(!isSearchOpen)} />
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden min-h-0">
              <div className="overflow-x-auto flex-1 overflow-y-auto relative">
                <table className="w-full text-left border-collapse relative">
                  <thead className="sticky top-0 z-40 shadow-sm">
                    <tr className="bg-slate-50 border-b-2 border-gray-300 text-base font-bold uppercase text-slate-700 tracking-wider">
                      <th className="px-2 py-2 whitespace-nowrap w-[110px] bg-slate-50 text-center sticky top-0 z-30">手机号</th>
                      <th className="px-2 py-2 w-[140px] whitespace-nowrap bg-slate-50 sticky top-0 z-30">项目/质保期</th>
                      <th className="px-2 py-2 whitespace-nowrap w-[90px] bg-slate-50 text-center sticky top-0 z-30">状态</th>
                      
                      {/* --- 已有列 --- */}
                      <th className="px-2 py-2 whitespace-nowrap w-[50px] bg-slate-50 text-center sticky top-0 z-30">系数</th>
                      <th className="px-2 py-2 whitespace-nowrap min-w-[120px] bg-slate-50 text-center sticky top-0 z-30">地域</th>
                      <th className="px-2 py-2 max-w-[120px] whitespace-nowrap bg-slate-50 sticky top-0 z-30">详细地址</th> 
                      <th className="px-2 py-2 max-w-[140px] whitespace-nowrap bg-slate-50 sticky top-0 z-30">详情</th>
                      
                      <th className="px-2 py-2 whitespace-nowrap w-[70px] bg-slate-50 text-center sticky top-0 z-30">建议分成</th>
                      <th className="px-2 py-2 whitespace-nowrap w-[80px] bg-slate-50 text-center sticky top-0 z-30">建议方式</th>
                      <th className="px-2 py-2 whitespace-nowrap w-[80px] bg-slate-50 text-center sticky top-0 z-30">划线价</th>
                      <th className="px-2 py-2 whitespace-nowrap w-[80px] bg-slate-50 text-center sticky top-0 z-30">历史价</th>
                      <th className="px-2 py-2 whitespace-nowrap w-[70px] bg-slate-50 text-center sticky top-0 z-30">来源</th>
                      
                      <th className="px-2 py-2 whitespace-nowrap w-[160px] bg-slate-50 sticky top-0 z-30">订单/工单号</th>
                      <th className="px-2 py-2 whitespace-nowrap w-[110px] bg-slate-50 sticky top-0 z-30">录单/上门</th>
                      <th className="px-2 py-2 whitespace-nowrap w-[60px] bg-slate-50 text-center sticky top-0 z-30">资源</th>

                      {/* --- 新增列 (24列) --- */}
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">是否有券</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">是否验券</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">是否已读</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">是否拨打</th>
                      
                      {/* 注意：以下列在初始视图中会被右侧固定列遮挡，滑动横条才会出现 */}
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">质保期</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">工作机</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">客户姓名</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">派单员</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">录单员</th>
                      
                      {/* 改动：师傅列变为师傅/手机号 */}
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">师傅/手机号</th>
                      
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">总收款</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">成本</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">业绩</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">实付金额</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">垫付金额</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">其他收款</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">完工收入</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">服务时间</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">完成时间</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">收款时间</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">作废人/原因</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 sticky top-0 z-30 max-w-[150px]">作废详情</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 sticky top-0 z-30 max-w-[150px]">取消原因/详情</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 sticky top-0 z-30 max-w-[150px]">收藏备注</th>

                      {/* --- 固定列 (联系人, 催单, 操作) --- */}
                      <th className="px-2 py-2 whitespace-nowrap text-center min-w-[200px] w-[200px] sticky-th-solid sticky-col sticky-right-contact">联系人</th>
                      <th className="px-2 py-2 whitespace-nowrap text-center w-[80px] sticky-th-solid sticky-col sticky-right-remind border-l border-gray-200">催单</th> 
                      <th className="px-2 py-2 text-center sticky-th-solid sticky-col sticky-right-action whitespace-nowrap w-[70px] border-l border-gray-200">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300">
                    {currentData.map((order, index) => (
                      <tr key={order.id} onMouseLeave={handleMouseEnterOther} className="bg-white even:bg-blue-50 hover:!bg-blue-100 transition-colors group border-b border-gray-300 last:border-0 align-middle">
                        
                        {/* 手机号: 增加字号 */}
                        <td className="px-2 py-2 text-slate-800 font-bold text-[12px] tabular-nums whitespace-nowrap align-middle text-center" onMouseEnter={handleMouseEnterOther}>{order.mobile}</td>
                        
                        {/* 服务项目: 增加字号 */}
                        <td className="px-2 py-2 align-middle whitespace-nowrap" onMouseEnter={handleMouseEnterOther}>
                          <ServiceItemCell item={order.serviceItem} warranty={order.warrantyPeriod} />
                        </td>
                        
                        <td className="px-2 py-2 align-middle" onMouseEnter={() => setHoveredTooltipCell({rowId: order.id, colKey: 'service'})}>
                          <StatusCell order={order} />
                        </td>

                        {/* 系数: 增加字号 */}
                        <td className="px-2 py-2 text-center align-middle" onMouseEnter={handleMouseEnterOther}>
                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold text-[13px]">{order.weightedCoefficient.toFixed(1)}</span>
                        </td>

                        {/* 地域: 不变 */}
                        <td className="px-2 py-2 text-slate-700 whitespace-nowrap align-middle text-center text-[12px]" onMouseEnter={handleMouseEnterOther}>
                            <div className="relative pr-8 inline-block"> 
                                {order.region}
                                <span className="absolute bottom-0 right-0 text-[9px] text-blue-600 border border-blue-200 bg-blue-50 px-1 rounded">
                                  {order.regionPeople}人
                                </span>
                            </div>
                        </td>
                        
                        {/* 详细地址: 不变 */}
                        <td className="px-2 py-2 align-middle" onMouseEnter={() => setHoveredTooltipCell({rowId: order.id, colKey: 'address'})}>
                          <TooltipCell content={order.address} maxWidthClass="max-w-[120px]" showTooltip={hoveredTooltipCell?.rowId === order.id && hoveredTooltipCell?.colKey === 'address'} />
                        </td>
                        
                        {/* 详情: 不变 */}
                        <td className="px-2 py-2 align-middle" onMouseEnter={() => setHoveredTooltipCell({rowId: order.id, colKey: 'details'})}>
                          <TooltipCell content={order.details} maxWidthClass="max-w-[140px]" showTooltip={hoveredTooltipCell?.rowId === order.id && hoveredTooltipCell?.colKey === 'details'} />
                        </td>
                        
                        {/* 建议分成: 增加字号 12 -> 14 */}
                        <td className="px-2 py-2 text-center align-middle font-medium text-slate-600 text-[14px]" onMouseEnter={handleMouseEnterOther}>
                           {order.serviceRatio}
                        </td>
                        
                        {/* 建议方式: 增加字号 */}
                        <td className="px-2 py-2 text-center align-middle" onMouseEnter={handleMouseEnterOther}>
                           <span className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px] text-gray-600 whitespace-nowrap">{order.suggestedMethod}</span>
                        </td>

                         {/* 划线价: 增加字号 */}
                        <td className="px-2 py-2 text-center align-middle font-medium text-slate-600 text-[13px]" onMouseEnter={handleMouseEnterOther}>
                           {formatCurrency(order.guidePrice)}
                        </td>

                         {/* 历史价: 增加字号 */}
                        <td className="px-2 py-2 text-center align-middle font-medium text-slate-600 text-[13px]" onMouseEnter={handleMouseEnterOther}>
                           {order.historicalPrice}
                        </td>

                        {/* 来源: 增加字号 */}
                        <td className="px-2 py-2 align-middle text-center" onMouseEnter={handleMouseEnterOther}><span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[11px] border border-slate-200 whitespace-nowrap font-medium">{order.source}</span></td>
                        
                        {/* 订单/工单号: 不变 */}
                        <td className="px-2 py-2 align-middle" onMouseEnter={handleMouseEnterOther}>
                            <CombinedIdCell orderNo={order.orderNo} workOrderNo={order.workOrderNo} hasAdvancePayment={order.hasAdvancePayment} depositAmount={order.depositAmount} />
                        </td>

                        {/* 录单/上门时间: 不变 */}
                        <td className="px-2 py-2 align-middle" onMouseEnter={handleMouseEnterOther}>
                            <CombinedTimeCell recordTime={order.recordTime} dispatchTime={order.dispatchTime} />
                        </td>

                        {/* 资源: 不变 */}
                        <td className="px-2 py-2 align-middle text-center" onMouseEnter={handleMouseEnterOther}>
                            <button className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"><Search size={14} /></button>
                        </td>

                        {/* --- 新增列内容 (24列) --- */}
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap">{order.hasCoupon ? <Check size={14} className="text-green-500 mx-auto"/> : <span className="text-gray-300">-</span>}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap">{order.isCouponVerified ? <span className="text-green-600 font-bold text-[13px]">是</span> : <span className="text-gray-400 text-[13px]">否</span>}</td>
                        
                        {/* 是否已读 */}
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap">
                            {order.isRead ? <span className="text-gray-400 text-[12px]">已读</span> : <span className="text-orange-500 text-[12px]">未读</span>}
                        </td>
                        
                        {/* 是否拨打 */}
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap">
                            {order.isCalled ? <span className="text-gray-400 text-[12px]">已拨打</span> : <span className="text-orange-500 text-[12px]">未拨打</span>}
                        </td>
                        
                        {/* 增加字号 */}
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-600 text-[13px]">{order.warrantyPeriod}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-600 text-[13px]">{order.workPhone}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-700 font-medium text-[13px]">{order.customerName}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-600 text-[13px]">{order.dispatcherName}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-600 text-[13px]">{order.recorderName}</td>
                        
                        {/* 改动：师傅列变为两行显示 */}
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap">
                            <div className="flex flex-col items-center">
                                <span className="text-slate-700 font-medium text-[13px]">{order.masterName}</span>
                                <span className="text-slate-400 text-[11px]">{order.masterPhone}</span>
                            </div>
                        </td>
                        
                        {/* 增加字号 */}
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-emerald-600 font-bold text-[13px]">{formatCurrency(order.totalReceipt)}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-slate-500 text-[13px]">{formatCurrency(order.cost)}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-orange-600 font-bold text-[13px]">{formatCurrency(order.revenue)}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-slate-700 text-[13px]">{formatCurrency(order.actualPaid)}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-slate-700 text-[13px]">{formatCurrency(order.advancePaymentAmount)}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-slate-700 text-[13px]">{formatCurrency(order.otherReceipt)}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-slate-700 text-[13px]">{formatCurrency(order.completionIncome)}</td>
                        
                        {/* 时间列: 增加字号 */}
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-[12px] text-slate-500">{order.serviceTime || '-'}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-[12px] text-slate-500">{order.completionTime || '-'}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-[12px] text-slate-500">{order.paymentTime || '-'}</td>
                        
                        {/* 增加字号 */}
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-500 text-[12px]">{order.voiderNameAndReason || '-'}</td>
                        <td className="px-2 py-2 align-middle whitespace-nowrap"><TooltipCell content={order.voidDetails || '-'} maxWidthClass="max-w-[150px]" showTooltip={false} /></td>
                        <td className="px-2 py-2 align-middle whitespace-nowrap"><TooltipCell content={order.cancelReasonAndDetails || '-'} maxWidthClass="max-w-[150px]" showTooltip={false} /></td>
                        <td className="px-2 py-2 align-middle whitespace-nowrap text-slate-500 text-[12px]">{order.favoriteRemark || '-'}</td>


                        {/* --- 固定列 (联系人, 催单, 操作) --- */}
                        <td className="px-2 py-2 align-middle text-center sticky-col sticky-right-contact sticky-bg-solid" onMouseEnter={handleMouseEnterOther}>
                          <div className="grid grid-cols-2 gap-2 p-1 w-full">
                            <button onClick={() => handleOpenChat('派单员', order)} className="text-[11px] w-full py-1 px-1 rounded border border-slate-300 bg-white hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap font-medium shadow-sm">派单员</button>
                            <button onClick={() => handleOpenChat('运营', order)} className="text-[11px] w-full py-1 px-1 rounded border border-slate-300 bg-white hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap font-medium shadow-sm">运营</button>
                            <button onClick={() => handleOpenChat('售后', order)} className="text-[11px] w-full py-1 px-1 rounded border border-slate-300 bg-white hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap font-medium shadow-sm">售后</button>
                            <button onClick={() => handleOpenChat('群聊', order)} className="text-[11px] w-full py-1 px-1 rounded border border-slate-300 bg-white hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap font-medium shadow-sm">群聊</button>
                          </div>
                        </td>
                        <td className="px-2 py-2 align-middle text-center sticky-col sticky-right-remind sticky-bg-solid border-l border-gray-200" onMouseEnter={handleMouseEnterOther}><ReminderCell order={order} onRemind={handleRemindOrder} /></td>
                        <td className="px-2 py-2 text-center sticky-col sticky-right-action sticky-bg-solid whitespace-nowrap border-l border-gray-200"><ActionCell orderId={order.id} onAction={handleAction} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* --- 分页栏: 使用新的 Pagination 组件并居中 --- */}
              <div className="bg-white px-6 py-3 border-t border-gray-200 mt-auto flex justify-center">
                 <Pagination 
                    total={totalItems} 
                    current={currentPage} 
                    pageSize={pageSize} 
                    onPageChange={setCurrentPage}
                    onSizeChange={setPageSize}
                 />
              </div>
            </div>
          </>
        );
      case '订单收款': return <OrderPaymentView />;
      case '报错订单': return <ErrorOrderView />;
      case '直派订单': return <DirectDispatchView />;
      case '派单业绩': return <DispatchPerformanceView />;
      case '改单记录': return <ChangeRecordView />;
      case '长期订单': return <LongTermOrderView />;
      case '转派记录': return <TransferRecordView />;
      case '派单记录': return <DispatchRecordView />;
      case '录单价格': return <RecordingPriceView />;
      case '报价':     return <QuotationView />;
      case '待入单库': return <PendingEntryView />;
      case '单库':     return <OrderLibraryView />;
      case '微信收款': return <WeChatCollectionView />;
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 m-1">
             <div className="text-4xl text-slate-200 mb-4 font-thin">🚧</div>
             <div className="text-slate-500 font-medium text-sm">{activeTab} 功能模块正在开发中...</div>
             <div className="text-slate-400 text-xs mt-2">请切换回“订单管理”查看</div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-200 to-slate-300 px-[12px] py-6 flex flex-col overflow-hidden">
      <style>{`
        /* 1. 全局单元格层级重置 */
        td, th {
          z-index: 1;
          position: relative;
        }

        /* 2. 右侧固定列：最高层级 */
        .sticky-col {
          position: sticky !important;
          z-index: 100 !important;
          background-clip: padding-box;
        }
        
        thead th.sticky-col {
          z-index: 110 !important;
        }
        
        thead th:not(.sticky-col) {
          z-index: 50; 
        }

        /* 3. 背景色 */
        th.sticky-th-solid {
          background-color: #f8fafc !important;
        }
        tr td.sticky-bg-solid {
          background-color: #ffffff !important;
        }
        tr:nth-child(even) td.sticky-bg-solid {
          background-color: #eff6ff !important; 
        }
        tr:hover td.sticky-bg-solid {
          background-color: #dbeafe !important; 
        }

        /* 4. 定位 */
        .sticky-right-contact {
          right: 150px !important;
          border-left: 1px solid #cbd5e1 !important;
          box-shadow: -6px 0 10px -4px rgba(0,0,0,0.15);
        }
        .sticky-right-remind {
          right: 70px !important;
        }
        .sticky-right-action {
          right: 0px !important;
        }
      `}</style>
      <div className="w-full flex-1 flex flex-col h-full">
        <NotificationBar />
        <QuickNav activeTab={activeTab} onTabChange={setActiveTab} />
        {renderContent()}
      </div>
      <RecordOrderModal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} />
      <CompleteOrderModal isOpen={completeModalOpen} onClose={() => setCompleteModalOpen(false)} order={currentOrder} />
      <ChatModal isOpen={chatState.isOpen} onClose={() => setChatState(prev => ({ ...prev, isOpen: false }))} role={chatState.role} order={chatState.order} />
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const appRoot = createRoot(container);
  appRoot.render(<App />);
}