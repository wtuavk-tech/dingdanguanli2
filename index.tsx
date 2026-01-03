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
  RefreshCw,
  Volume2,
  Flame,
  Star,
  ShieldAlert,
  FileDigit,
  Layout,
  Headset
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

const FULL_MOCK_DATA: Order[] = Array.from({ length: 100 }).map((_, i) => ({
  id: i + 1,
  orderNo: `ORDER-2023-${String(i).padStart(2, '0')}`,
  workOrderNo: `WORK-${String(i).padStart(4, '0')}`,
  dispatchTime: '2023-12-01 10:00',
  mobile: `138${String(Math.random()).slice(2, 10)}`,
  serviceItem: i % 3 === 0 ? '空调清洗' : '马桶疏通',
  serviceRatio: '3:7',
  status: i % 5 === 0 ? OrderStatus.PendingDispatch : OrderStatus.Completed,
  region: '北京市朝阳区',
  address: '朝阳北路101号朝阳北路101号',
  details: '客户备注尽量早点到',
  recordTime: '2023-12-01 09:00',
  source: '美团',
  totalAmount: 200,
  cost: 50,
  hasAdvancePayment: i % 10 === 0,
  depositAmount: i % 10 === 0 ? 50 : 0,
  weightedCoefficient: 1.0,
  regionPeople: 5,
  isReminded: false,
  suggestedMethod: '自营',
  guidePrice: 180,
  historicalPrice: '150-200',
  hasCoupon: i % 4 === 0,
  isCouponVerified: i % 4 === 0 && i % 2 === 0,
  isRead: i % 3 !== 0,
  isCalled: i % 2 === 0,
  warrantyPeriod: '3个月',
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
  completionTime: '2023-12-01 12:00',
  paymentTime: '2023-12-01 12:30',
  serviceTime: '2023-12-01 11:00',
  voiderNameAndReason: '',
  voidDetails: '',
  cancelReasonAndDetails: '',
  favoriteRemark: ''
}));

const FilterContainer = ({ isSearchOpen, onToggleSearch, extraButtons, children }: any) => (
  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 mb-2">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
         <button onClick={onToggleSearch} className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 font-source-han">
           <Filter size={14} /> 筛选
           {isSearchOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
         </button>
      </div>
      {extraButtons}
    </div>
    {isSearchOpen && <div className="mt-2 pt-2 border-t border-gray-100">{children}</div>}
  </div>
);

const DataOverview = ({ items }: { items: { label: string; value: string | number }[] }) => (
  <div className="flex gap-4 mb-2 font-source-han">
    {items.map((item, idx) => (
      <div key={idx} className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex flex-col">
        <span className="text-xs text-slate-500 font-source-han">{item.label}</span>
        <span className="text-lg font-bold text-slate-800 font-source-han">{item.value}</span>
      </div>
    ))}
  </div>
);

const Pagination = ({ total, current, pageSize, onPageChange, onSizeChange }: any) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [inputVal, setInputVal] = useState('');

  const handleJump = () => {
      if (!inputVal) return;
      const p = parseInt(inputVal);
      if (!isNaN(p)) {
          let target = p;
          if (target < 1) target = 1;
          if (target > totalPages) target = totalPages;
          onPageChange(target);
          setInputVal('');
      }
  };

  // Logic to show pages (sliding window of 7)
  const maxVisible = 7;
  let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
  }

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500 font-source-han select-none">
      <span>共 <span className="font-bold">{total}</span> 条</span>
      
      <select 
        value={pageSize} 
        onChange={e => onSizeChange(Number(e.target.value))}
        className="border border-slate-300 rounded px-2 py-1 mx-2 outline-none hover:border-blue-400 cursor-pointer bg-white"
      >
        {[10, 20, 50, 100].map(size => <option key={size} value={size}>{size}条/页</option>)}
      </select>

      <button 
        onClick={() => onPageChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="p-1 hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="flex items-center">
          {pages.map(p => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs transition-colors mx-0.5 ${
                    current === p 
                    ? 'text-blue-600 font-bold' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                  {p}
              </button>
          ))}
      </div>

      <button 
        onClick={() => onPageChange(Math.min(totalPages, current + 1))}
        disabled={current === totalPages}
        className="p-1 hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>

      <div className="flex items-center gap-2 ml-2">
          <span>前往</span>
          <input 
            className="w-10 h-7 border border-slate-300 rounded text-center outline-none focus:border-blue-500 text-xs"
            placeholder={String(current)}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') handleJump();
            }}
            onBlur={handleJump}
          />
          <span>页</span>
      </div>
    </div>
  );
};

const NotificationBar = () => (
  <div className="bg-white px-4 py-2.5 rounded-lg mb-3 flex items-center justify-between text-xs shadow-sm border border-slate-200 font-source-han">
    <div className="flex items-center gap-6 overflow-hidden mr-4 flex-1">
      {/* Badge */}
      <div className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1 rounded-[4px] text-[11px] font-bold shrink-0 tracking-wide font-source-han shadow-sm z-10 relative">
        <span>主要公告</span>
        <Bell size={10} fill="currentColor" strokeWidth={3} />
      </div>
      
      {/* Static List Content matching image style */}
      <div className="flex items-center gap-12 text-slate-600 font-medium h-full overflow-hidden">
           <div className="flex items-center gap-2">
              <Megaphone size={14} className="text-[#ef4444]" />
              <span className="truncate">10月业绩pk赛圆满结束，恭喜华东大区获得冠军！</span>
           </div>
           <div className="flex items-center gap-2 hidden lg:flex">
              <Volume2 size={14} className="text-orange-500" />
              <span className="truncate">系统升级通知：今晚 24:00 将进行系统维护。</span>
           </div>
           <div className="flex items-center gap-2 hidden xl:flex">
               <Info size={14} className="text-blue-500" />
               <span className="truncate">关于 2025 年度秋季职级晋升评审的通知。</span>
           </div>
      </div>
    </div>

    {/* Date */}
    <div className="bg-white text-slate-400 border border-slate-200 px-3 py-1 rounded-[4px] text-[11px] font-mono shrink-0 ml-4 relative">
      2025-11-19
    </div>
  </div>
);

// --- 优化后的导航栏组件 (GRID + 新样式) ---
const QuickNav = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => {
  const items = [
    '订单管理', '直派订单', '报错订单', '订单收款', '派单业绩', '改单记录', '长期订单',
    '转派记录', '派单记录', '录单价格', '报价', '待入单库', '单库', '微信收款'
  ];
  
  // Colors matching the dashboard cards in the image
  const colors = [
     { border: 'border-red-500', icon: 'text-white', bg: 'bg-red-500', iconComp: <ShieldAlert size={14} /> },      // 日报预警 like
     { border: 'border-yellow-500', icon: 'text-white', bg: 'bg-yellow-500', iconComp: <Bell size={14} /> }, // 预警通知 like
     { border: 'border-blue-500', icon: 'text-white', bg: 'bg-blue-500', iconComp: <SlidersHorizontal size={14} /> }, // 任务设定 like
     { border: 'border-green-500', icon: 'text-white', bg: 'bg-green-500', iconComp: <CheckCircle size={14} /> }, // 任务 like
     { border: 'border-cyan-500', icon: 'text-white', bg: 'bg-cyan-500', iconComp: <FileDigit size={14} /> }, // 工作日报 like
     { border: 'border-purple-500', icon: 'text-white', bg: 'bg-purple-500', iconComp: <Megaphone size={14} /> }, // 公告配置 like
  ];

  return (
    <div className="grid grid-cols-7 gap-3 mb-3 px-1">
      {items.map((item, index) => {
        const isActive = activeTab === item;
        const colorStyle = colors[index % colors.length];

        // Base styles: white bg, specific colored border always applied
        let buttonClass = `h-10 rounded-lg text-sm font-bold shadow-sm transition-all duration-200 border ${colorStyle.border} flex items-center justify-center gap-2 font-source-han relative overflow-hidden bg-white `;
        
        if (isActive) {
           // Selected State: darker text, shadow, zoom effect
           buttonClass += "text-slate-800 shadow-md transform scale-105 ";
        } else {
           // Unselected State: lighter text
           buttonClass += "text-slate-500 hover:text-slate-700 hover:bg-gray-50 ";
        }

        return (
          <button 
            key={index} 
            onClick={() => onTabChange(item)}
            className={buttonClass}
          >
            {/* Colored Icon Circle - Always colored */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${colorStyle.bg} ${colorStyle.icon}`}>
               {colorStyle.iconComp}
            </div>
            <span>{item}</span>
          </button>
        );
      })}
    </div>
  );
};

const ActionBar = ({ onRecord, isSearchOpen, onToggleSearch }: any) => (
  <div className="flex justify-between items-center mb-2">
    <div className="flex gap-2">
      <button onClick={onRecord} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700 shadow-sm transition-all font-source-han">
        <Plus size={14} /> 录单
      </button>
      <button className="flex items-center gap-1 bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition-all font-source-han">
        <Upload size={14} /> 导入
      </button>
    </div>
    <div className="flex gap-2">
       <button onClick={onToggleSearch} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all border font-source-han ${isSearchOpen ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-600 border-slate-300'}`}>
         <Filter size={14} /> 筛选
       </button>
       <button className="flex items-center gap-1 bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition-all font-source-han">
         <RefreshCw size={14} /> 刷新
       </button>
    </div>
  </div>
);

const SearchPanel = ({ isOpen, onToggle }: any) => {
  if (!isOpen) return null;
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-3 animate-in slide-in-from-top-2 duration-200">
      <div className="grid grid-cols-6 gap-3">
         <div className="flex flex-col gap-1">
           <label className="text-xs text-slate-500 font-source-han">订单号/手机号</label>
           <input className="h-8 border border-slate-200 rounded px-2 text-xs focus:border-blue-500 outline-none font-mono" placeholder="请输入..." />
         </div>
         <div className="flex items-end gap-2">
            <button className="h-8 px-4 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 w-full font-source-han">查询</button>
            <button className="h-8 px-4 bg-slate-100 text-slate-600 rounded text-xs hover:bg-slate-200 w-full font-source-han">重置</button>
         </div>
      </div>
    </div>
  );
};

const ServiceItemCell = ({ item, warranty }: any) => (
  <div className="flex flex-col">
    <span className="font-medium text-slate-700 text-[13px] font-source-han">{item}</span>
    <span className="text-[11px] text-slate-400 font-source-han">保: {warranty}</span>
  </div>
);

const StatusCell = ({ order }: { order: Order }) => {
  const getStatusColor = (s: OrderStatus) => {
    switch(s) {
      case OrderStatus.PendingDispatch: return 'bg-orange-100 text-orange-600 border-orange-200';
      case OrderStatus.Completed: return 'bg-green-100 text-green-600 border-green-200';
      case OrderStatus.Void: return 'bg-gray-100 text-gray-500 border-gray-200';
      case OrderStatus.Error: return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-blue-50 text-blue-600 border-blue-200';
    }
  };
  return (
    <div className={`px-2 py-0.5 rounded text-[11px] border text-center font-medium font-source-han ${getStatusColor(order.status)}`}>
      {order.status}
    </div>
  );
};

const TooltipCell = ({ content, maxWidthClass, showTooltip }: any) => (
  <div className={`relative group ${maxWidthClass}`}>
    <div className="truncate text-slate-600 text-[13px] cursor-pointer font-source-han">{content}</div>
    {showTooltip && (
      <div className="absolute bottom-full left-0 mb-1 bg-slate-800 text-white text-xs p-2 rounded shadow-lg z-50 whitespace-normal min-w-[200px] font-source-han">
        {content}
      </div>
    )}
  </div>
);

const CombinedIdCell = ({ orderNo, workOrderNo, hasAdvancePayment, depositAmount }: any) => (
  <div className="flex flex-col">
    <span className="text-[12px] text-blue-600 font-medium font-mono">{orderNo}</span>
    <span className="text-[11px] text-slate-400 font-mono">{workOrderNo}</span>
    {hasAdvancePayment && <span className="text-[10px] text-orange-500 bg-orange-50 px-1 rounded w-fit mt-0.5 font-mono">垫: {depositAmount}</span>}
  </div>
);

const CombinedTimeCell = ({ recordTime, dispatchTime }: any) => (
  <div className="flex flex-col">
    <span className="text-[11px] text-slate-500 font-mono">录: {recordTime}</span>
    <span className="text-[11px] text-slate-500 font-mono">派: {dispatchTime}</span>
  </div>
);

const ReminderCell = ({ order, onRemind }: any) => (
  <div className="text-center">
    <button 
      onClick={() => onRemind(order.id)}
      className={`p-1.5 rounded-full transition-all ${order.isReminded ? 'bg-orange-100 text-orange-500' : 'bg-slate-100 text-slate-400 hover:bg-orange-50 hover:text-orange-500'}`}
    >
      <Bell size={14} fill={order.isReminded ? "currentColor" : "none"} />
    </button>
  </div>
);

const ActionCell = ({ orderId, onAction }: any) => (
  <div className="flex justify-center gap-1">
    <button onClick={() => onAction('完单', orderId)} className="p-1 text-green-600 hover:bg-green-50 rounded"><CheckCircle size={14} /></button>
    <button onClick={() => onAction('详情', orderId)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><FileText size={14} /></button>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: any) => {
    if(!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-slate-800 font-source-han">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={20} className="text-slate-500" /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 font-source-han">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

const RecordOrderModal = ({ isOpen, onClose }: any) => (
    <Modal isOpen={isOpen} onClose={onClose} title="录入新订单">
        <div className="space-y-4 font-source-han">
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1"><label className="text-xs text-slate-500">客户手机</label><input className="w-full border p-2 rounded text-sm font-mono"/></div>
                 <div className="space-y-1"><label className="text-xs text-slate-500">服务项目</label><input className="w-full border p-2 rounded text-sm"/></div>
             </div>
             <div className="flex justify-end pt-4">
                 <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">提交订单</button>
             </div>
        </div>
    </Modal>
);

const CompleteOrderModal = ({ isOpen, onClose, order }: any) => (
    <Modal isOpen={isOpen} onClose={onClose} title="完成订单">
        <div className="space-y-4 font-source-han">
            <p className="text-sm text-slate-600">确认完成订单 <span className="font-bold font-mono">{order?.orderNo}</span> ?</p>
             <div className="space-y-1"><label className="text-xs text-slate-500">收款金额</label><input className="w-full border p-2 rounded text-sm font-mono" placeholder="0.00"/></div>
             <div className="flex justify-end pt-4 gap-2">
                 <button onClick={onClose} className="bg-gray-100 text-slate-600 px-4 py-2 rounded text-sm hover:bg-gray-200">取消</button>
                 <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">确认完单</button>
             </div>
        </div>
    </Modal>
);

const ChatModal = ({ isOpen, onClose, role, order }: any) => (
    <Modal isOpen={isOpen} onClose={onClose} title={`与 ${role} 聊天 - ${order?.orderNo}`}>
        <div className="h-64 bg-slate-50 rounded border border-slate-200 mb-4 p-4 flex flex-col items-center justify-center text-slate-400 font-source-han">
            <MessageCircle size={32} className="mb-2"/>
            <p>聊天记录为空</p>
        </div>
        <div className="flex gap-2">
            <input className="flex-1 border p-2 rounded text-sm font-source-han" placeholder="输入消息..."/>
            <button className="bg-blue-600 text-white px-4 py-2 rounded"><Send size={16}/></button>
        </div>
    </Modal>
);

// 1. 转派记录视图
const TransferRecordView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateTransferData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}>
         {/* ... filters ... */}
         <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">订单号/手机号</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-48 font-mono" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">操作人员</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32 font-source-han" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">转给人</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32 font-source-han" placeholder="请输入内容" /></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs font-source-han">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs font-source-han">重置</button>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr className="font-source-han">
              {['序号','订单号','创建时间','手机号','操作人员','转给人','备注','创建人'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
             {data.map((row, i) => (
               <tr key={row.id} className="even:bg-[#FFF0F0] hover:bg-red-50 transition-colors">
                 <td className="px-3 py-2 text-center font-mono">{row.id}</td>
                 <td className="px-3 py-2 font-mono">{row.orderNo}</td>
                 <td className="px-3 py-2 font-mono">{row.createTime}</td>
                 <td className="px-3 py-2 font-mono">{row.mobile}</td>
                 <td className="px-3 py-2 font-source-han">{row.operator}</td>
                 <td className="px-3 py-2 font-source-han">{row.transferTo}</td>
                 <td className="px-3 py-2 font-source-han">{row.remark}</td>
                 <td className="px-3 py-2 font-source-han">{row.creator}</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
      {/* ... pagination ... */}
      <div className="mt-2 text-xs text-slate-500 px-2 flex justify-center gap-2 items-center">
         <span className="font-source-han">共 <span className="font-mono">398</span> 条</span>
         <select className="border text-xs font-mono"><option>10条/页</option></select>
         <button className="border px-2 py-0.5 bg-blue-500 text-white rounded font-source-han">1</button>
         <button className="border px-2 py-0.5 rounded font-mono">2</button>
         <button className="border px-2 py-0.5 rounded font-mono">3</button>
         <span className="font-source-han">...</span>
         <button className="border px-2 py-0.5 rounded font-mono">60</button>
         <button className="border px-2 py-0.5 rounded font-source-han">{'>'}</button>
         <span className="font-source-han">前往 <input className="w-8 border text-center font-mono"/> 页</span>
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
      {/* ... header & filters ... */}
      <div className="mb-2">
         <DataOverview items={[{ label: '派单总数', value: 398 }, { label: '今日派单', value: 12 }]} />
      </div>
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)} extraButtons={<button className="bg-green-500 text-white px-3 py-1 text-xs rounded font-source-han">导出</button>}>
         <div className="grid grid-cols-6 gap-3">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">订单号/手机号</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-mono" /></div>
             <div className="flex items-center gap-2 col-span-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">派单时间</span><input type="date" className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-mono" /><span className="text-xs font-source-han">-</span><input type="date" className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-mono" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">派单员</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-source-han" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">上门师傅</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-source-han" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">师傅uid</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-mono" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">派单类型</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-source-han" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">派单方式</span><select className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-source-han"><option>请选择</option></select></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">状态</span><select className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-source-han"><option>请选择</option></select></div>
             <div className="col-span-1 flex gap-2">
                <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs w-full font-source-han">搜索</button>
                <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs w-full font-source-han">重置</button>
             </div>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr className="font-source-han">
              {['序号','订单号','派单时间','手机号','派单员','派单方式','技术服务费缴纳状态','派单类型','派单备注','完工图片','创建人','创建时间','状态','上门师傅','师傅uid','接单时间','预约上门时间','拒绝原因','抢接时间','完成时间','师傅备注','退回原因','退回时间','操作'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
             {data.map((row, i) => (
               <tr key={row.id} className="even:bg-[#FFF0F0] hover:bg-red-50 transition-colors">
                 <td className="px-3 py-2 text-center font-mono">{row.id}</td>
                 <td className="px-3 py-2 text-blue-600 font-mono">{row.orderNo}</td>
                 <td className="px-3 py-2 whitespace-nowrap font-mono">{row.dispatchTime}</td>
                 <td className="px-3 py-2 font-mono">{row.mobile}</td>
                 <td className="px-3 py-2 font-source-han">{row.dispatcher}</td>
                 <td className="px-3 py-2 font-source-han">{row.method}</td>
                 <td className="px-3 py-2 font-source-han">{row.techFeeStatus}</td>
                 <td className="px-3 py-2 font-source-han">{row.type}</td>
                 <td className="px-3 py-2 font-source-han">{row.remark}</td>
                 <td className="px-3 py-2 text-blue-600 font-source-han">{row.pic}</td>
                 <td className="px-3 py-2 font-source-han">{row.creator}</td>
                 <td className="px-3 py-2 whitespace-nowrap font-mono">{row.createTime}</td>
                 <td className="px-3 py-2 font-source-han">{row.status}</td>
                 <td className="px-3 py-2 font-source-han">{row.master}</td>
                 <td className="px-3 py-2 font-mono">{row.masterId}</td>
                 <td className="px-3 py-2 whitespace-nowrap font-mono">{row.acceptTime}</td>
                 <td className="px-3 py-2 whitespace-nowrap font-mono">{row.appointTime}</td>
                 <td className="px-3 py-2 font-source-han">{row.rejectReason}</td>
                 <td className="px-3 py-2 font-mono">{row.grabTime}</td>
                 <td className="px-3 py-2 font-mono">{row.finishTime}</td>
                 <td className="px-3 py-2 font-source-han">{row.masterRemark}</td>
                 <td className="px-3 py-2 font-source-han">{row.returnReason}</td>
                 <td className="px-3 py-2 font-mono">{row.returnTime}</td>
                 <td className="px-3 py-2 text-blue-600 cursor-pointer whitespace-nowrap font-source-han">详情 修改 解决</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-slate-500 px-2 flex justify-end font-source-han">共 <span className="font-mono ml-1">0</span> 条</div>
    </div>
  );
};

// 3. 报错订单视图 (New)
const ErrorOrderView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateErrorData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}>
         <div className="flex gap-4 items-center flex-wrap">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">订单号/手机号</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32 font-mono" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">上报时间</span><input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs font-mono" /> <span className="text-xs font-source-han">-</span> <input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs font-mono" /></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs font-source-han">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs font-source-han">重置</button>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr className="font-source-han">
              {['序号','订单号','上报时间','手机号','来源','工作机','客户姓名','状态','录单员','师傅','派单员','上报人','报错类型','报错详情','处理详情','处理时间','解决方案','解决人','解决时间'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
             {data.map((row, i) => (
               <tr key={row.id} className="even:bg-[#FFF0F0] hover:bg-red-50 transition-colors">
                 <td className="px-3 py-2 text-center font-mono">{row.id}</td>
                 <td className="px-3 py-2 text-blue-600 font-mono">{row.orderNo}</td>
                 <td className="px-3 py-2 whitespace-nowrap font-mono">{row.reportTime}</td>
                 <td className="px-3 py-2 font-mono">{row.mobile}</td>
                 <td className="px-3 py-2 font-source-han">{row.source}</td>
                 <td className="px-3 py-2 font-mono">{row.workPhone}</td>
                 <td className="px-3 py-2 font-source-han">{row.clientName}</td>
                 <td className="px-3 py-2 font-source-han text-center"><span className="bg-red-50 text-red-500 border border-red-200 px-1 rounded">{row.status}</span></td>
                 <td className="px-3 py-2 font-source-han">{row.recorder}</td>
                 <td className="px-3 py-2 font-source-han">{row.master}</td>
                 <td className="px-3 py-2 font-source-han">{row.dispatcher}</td>
                 <td className="px-3 py-2 font-source-han">{row.reporter}</td>
                 <td className="px-3 py-2 font-source-han">{row.type}</td>
                 <td className="px-3 py-2 max-w-[150px] truncate font-source-han" title={row.detail}>{row.detail}</td>
                 <td className="px-3 py-2 max-w-[150px] truncate font-source-han" title={row.processDetail}>{row.processDetail}</td>
                 <td className="px-3 py-2 whitespace-nowrap font-mono">{row.processTime}</td>
                 <td className="px-3 py-2 font-source-han">{row.solution}</td>
                 <td className="px-3 py-2 font-source-han">{row.solver}</td>
                 <td className="px-3 py-2 whitespace-nowrap font-mono">{row.solveTime}</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 4. 直派订单视图 (New)
const DirectDispatchView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateDirectDispatchData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}>
         <div className="flex gap-4 items-center flex-wrap">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">订单号/手机号</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32 font-mono" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">商家单号</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32 font-mono" placeholder="请输入内容" /></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs font-source-han">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs font-source-han">重置</button>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr className="font-source-han">
              {['序号','订单号','商家','商家单号','状态','区域','地址','详情','来源','工作机','客户姓名','师傅','创建人','师傅ID','创建人ID','操作时间','取消原因','取消时间','录单时间','接单时间','总价','成本','利润','实付','订金','尾款','备注','完工收入','地图'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
             {data.map((row, i) => (
               <tr key={row.id} className="even:bg-[#FFF0F0] hover:bg-red-50 transition-colors">
                 <td className="px-3 py-2 text-center font-mono">{row.id}</td>
                 <td className="px-3 py-2 text-blue-600 font-mono">{row.orderNo}</td>
                 <td className="px-3 py-2 font-source-han">{row.merchant}</td>
                 <td className="px-3 py-2 font-mono">{row.merchantOrderNo}</td>
                 <td className="px-3 py-2 font-source-han">{row.status}</td>
                 <td className="px-3 py-2 max-w-[100px] truncate font-source-han" title={row.region}>{row.region}</td>
                 <td className="px-3 py-2 max-w-[100px] truncate font-source-han" title={row.address}>{row.address}</td>
                 <td className="px-3 py-2 max-w-[100px] truncate font-source-han" title={row.detail}>{row.detail}</td>
                 <td className="px-3 py-2 font-source-han">{row.source}</td>
                 <td className="px-3 py-2 font-mono">{row.workPhone}</td>
                 <td className="px-3 py-2 font-source-han">{row.clientName}</td>
                 <td className="px-3 py-2 font-source-han">{row.master}</td>
                 <td className="px-3 py-2 font-source-han">{row.creator}</td>
                 <td className="px-3 py-2 font-mono">{row.masterId}</td>
                 <td className="px-3 py-2 font-mono">{row.creatorId}</td>
                 <td className="px-3 py-2 whitespace-nowrap font-mono">{row.opTime}</td>
                 <td className="px-3 py-2 font-source-han">{row.cancelReason}</td>
                 <td className="px-3 py-2 font-mono">{row.cancelTime}</td>
                 <td className="px-3 py-2 whitespace-nowrap font-mono">{row.recordTime}</td>
                 <td className="px-3 py-2 whitespace-nowrap font-mono">{row.receiveTime}</td>
                 <td className="px-3 py-2 font-mono">{row.total}</td>
                 <td className="px-3 py-2 font-mono">{row.cost}</td>
                 <td className="px-3 py-2 font-mono">{row.revenue}</td>
                 <td className="px-3 py-2 font-mono">{row.paid}</td>
                 <td className="px-3 py-2 font-mono">{row.deposit}</td>
                 <td className="px-3 py-2 font-mono">{row.rest}</td>
                 <td className="px-3 py-2 font-source-han">{row.remark}</td>
                 <td className="px-3 py-2 font-mono">{row.finishIncome}</td>
                 <td className="px-3 py-2 text-blue-600 cursor-pointer font-source-han">{row.map}</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 5. 派单业绩视图 (New)
const DispatchPerformanceView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generatePerformanceData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}>
         <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">派单员</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32 font-source-han" placeholder="请输入内容" /></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs font-source-han">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs font-source-han">重置</button>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr className="font-source-han">
              {['序号','派单员','总业绩','手动派单线下业绩','手动派单平台业绩','手动派单总业绩','自动派单线下业绩','自动派单平台业绩','自动派单总业绩'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
             {data.map((row, i) => (
               <tr key={row.id} className="even:bg-[#FFF0F0] hover:bg-red-50 transition-colors">
                 <td className="px-3 py-2 text-center font-mono">{row.id}</td>
                 <td className="px-3 py-2 font-source-han">{row.dispatcher}</td>
                 <td className="px-3 py-2 font-bold text-red-600 font-mono">{row.total}</td>
                 <td className="px-3 py-2 font-mono">{row.manualOffline}</td>
                 <td className="px-3 py-2 font-mono">{row.manualPlatform}</td>
                 <td className="px-3 py-2 font-medium font-mono">{row.manualTotal}</td>
                 <td className="px-3 py-2 font-mono">{row.autoOffline}</td>
                 <td className="px-3 py-2 font-mono">{row.autoPlatform}</td>
                 <td className="px-3 py-2 font-medium font-mono">{row.autoTotal}</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 6. 改单记录视图 (New)
const ChangeRecordView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateChangeData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}>
         <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">订单号/手机号</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32 font-mono" placeholder="请输入内容" /></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs font-source-han">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs font-source-han">重置</button>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr className="font-source-han">
              {['序号','ID','订单号','修改时间','手机号','操作人'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
             {data.map((row, i) => (
               <tr key={row.id} className="even:bg-[#FFF0F0] hover:bg-red-50 transition-colors">
                 <td className="px-3 py-2 text-center font-mono">{row.id}</td>
                 <td className="px-3 py-2 text-center font-mono">{row.seq}</td>
                 <td className="px-3 py-2 text-blue-600 font-mono">{row.orderNo}</td>
                 <td className="px-3 py-2 whitespace-nowrap font-mono">{row.updateTime}</td>
                 <td className="px-3 py-2 font-mono">{row.mobile}</td>
                 <td className="px-3 py-2 font-source-han">{row.operator}</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 7. 长期订单视图 (New)
const LongTermOrderView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateLongTermData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
       <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}>
         <div className="flex gap-4 items-center flex-wrap">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">订单号/手机号</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32 font-mono" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">状态</span><select className="h-7 border border-blue-200 rounded px-2 text-xs w-24 font-source-han"><option>请选择</option></select></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs font-source-han">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs font-source-han">重置</button>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr className="font-source-han">
              {['序号','订单号','手机号','客户姓名','状态','师傅','录单员','派单员','创建时间','申请原因','证明材料'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
             {data.map((row, i) => (
               <tr key={row.id} className="even:bg-[#FFF0F0] hover:bg-red-50 transition-colors">
                 <td className="px-3 py-2 text-center font-mono">{row.id}</td>
                 <td className="px-3 py-2 text-blue-600 font-mono">{row.orderNo}</td>
                 <td className="px-3 py-2 font-mono">{row.mobile}</td>
                 <td className="px-3 py-2 font-source-han">{row.clientName}</td>
                 <td className="px-3 py-2 font-source-han">{row.status}</td>
                 <td className="px-3 py-2 font-source-han">{row.master}</td>
                 <td className="px-3 py-2 font-source-han">{row.recorder}</td>
                 <td className="px-3 py-2 font-source-han">{row.dispatcher}</td>
                 <td className="px-3 py-2 whitespace-nowrap font-mono">{row.createTime}</td>
                 <td className="px-3 py-2 font-source-han">{row.reason}</td>
                 <td className="px-3 py-2 text-blue-600 cursor-pointer font-source-han">{row.material}</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 8. 录单价格视图
const RecordingPriceView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateRecordingPriceData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)} extraButtons={
        <div className="flex gap-2">
           <button className="bg-blue-600 text-white px-3 py-1 text-xs rounded font-source-han">新增</button>
           <button className="bg-green-600 text-white px-3 py-1 text-xs rounded font-source-han">上传excel</button>
           <button className="bg-red-400 text-white px-3 py-1 text-xs rounded font-source-han">批量删除</button>
           <button className="bg-orange-400 text-white px-3 py-1 text-xs rounded font-source-han">强制删除</button>
        </div>
      }>
         <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">项目</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-48 font-source-han" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">地域</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-48 font-source-han" placeholder="请输入内容" /></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs font-source-han">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs font-source-han">重置</button>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr className="font-source-han">
              <th className="px-3 py-2 w-8"><input type="checkbox" /></th>
              {['序号','价格','体系名称','项目','地域','备注','操作'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
             {data.map((row, i) => (
               <tr key={row.id} className="even:bg-[#FFF0F0] hover:bg-red-50 transition-colors">
                 <td className="px-3 py-2 text-center"><input type="checkbox" /></td>
                 <td className="px-3 py-2 text-center font-mono">{row.id}</td>
                 <td className="px-3 py-2 font-mono">{row.price}</td>
                 <td className="px-3 py-2 font-source-han">{row.systemName}</td>
                 <td className="px-3 py-2 font-source-han">{row.item}</td>
                 <td className="px-3 py-2 font-source-han">{row.region}</td>
                 <td className="px-3 py-2 font-source-han">{row.remark}</td>
                 <td className="px-3 py-2 font-source-han">
                    <span className="text-blue-600 cursor-pointer mr-2">修改</span>
                    <span className="text-red-500 cursor-pointer">删除</span>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-slate-500 px-2 flex justify-center gap-2 items-center">
         <span className="font-source-han">共 <span className="font-mono">13</span> 条</span>
         <select className="border text-xs font-mono"><option>10条/页</option></select>
         <button className="border px-2 py-0.5 bg-blue-500 text-white rounded font-source-han">1</button>
         <button className="border px-2 py-0.5 rounded font-mono">2</button>
         <button className="border px-2 py-0.5 rounded font-source-han">{'>'}</button>
         <span className="font-source-han">前往 <input className="w-8 border text-center font-mono"/> 页</span>
       </div>
    </div>
  );
};

// 9. 报价视图
const QuotationView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateQuotationData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)} extraButtons={
        <div className="flex gap-2">
           <button className="bg-blue-600 text-white px-3 py-1 text-xs rounded font-source-han">新增</button>
           <button className="bg-green-600 text-white px-3 py-1 text-xs rounded font-source-han">上传excel</button>
           <button className="bg-red-400 text-white px-3 py-1 text-xs rounded font-source-han">批量删除</button>
           <button className="bg-orange-400 text-white px-3 py-1 text-xs rounded font-source-han">强制删除</button>
           <button className="bg-blue-400 text-white px-3 py-1 text-xs rounded font-source-han">添加报价图片</button>
           <button className="bg-blue-500 text-white px-3 py-1 text-xs rounded font-source-han">导出</button>
        </div>
      }>
         <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">项目</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32 font-source-han" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">地域</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32 font-source-han" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">服务时间</span><select className="h-7 border border-blue-200 rounded px-2 text-xs w-24 font-mono"><option>请选择</option></select><span className="text-xs">-</span><select className="h-7 border border-blue-200 rounded px-2 text-xs w-24 font-mono"><option>请选择</option></select></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">价格类型</span><select className="h-7 border border-blue-200 rounded px-2 text-xs w-32 font-source-han"><option>请选择</option></select></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs font-source-han">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs font-source-han">重置</button>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr className="font-source-han">
              <th className="px-3 py-2 w-8"><input type="checkbox" /></th>
              {['序号','城市','服务项目','服务时间','价格类型','公司对外报价','师傅结算底价','划线价/成单底价','建议师傅分成比例','报价内容','报价图片','备注','操作'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
             {data.map((row, i) => (
               <tr key={row.id} className="even:bg-[#FFF0F0] hover:bg-red-50 transition-colors">
                 <td className="px-3 py-2 text-center"><input type="checkbox" /></td>
                 <td className="px-3 py-2 text-center font-mono">{row.id}</td>
                 <td className="px-3 py-2 font-source-han">{row.city}</td>
                 <td className="px-3 py-2 font-source-han">{row.item}</td>
                 <td className="px-3 py-2 font-mono">{row.time}</td>
                 <td className="px-3 py-2 font-source-han">{row.type}</td>
                 <td className="px-3 py-2 font-mono">{row.publicPrice}</td>
                 <td className="px-3 py-2 font-mono">{row.basePrice}</td>
                 <td className="px-3 py-2 font-mono">{row.linePrice}</td>
                 <td className="px-3 py-2 font-mono">{row.ratio}</td>
                 <td className="px-3 py-2 max-w-[200px] truncate font-source-han" title={row.content}>{row.content}</td>
                 <td className="px-3 py-2 text-blue-600 cursor-pointer font-source-han">{row.pic}</td>
                 <td className="px-3 py-2 font-source-han">{row.remark}</td>
                 <td className="px-3 py-2 font-source-han">
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
         <span className="font-source-han">共 <span className="font-mono">48</span> 条</span>
         <select className="border text-xs font-mono"><option>10条/页</option></select>
         <button className="border px-2 py-0.5 bg-blue-500 text-white rounded font-source-han">1</button>
         <button className="border px-2 py-0.5 rounded font-mono">2</button>
         <button className="border px-2 py-0.5 rounded font-mono">3</button>
         <button className="border px-2 py-0.5 rounded font-mono">4</button>
         <button className="border px-2 py-0.5 rounded font-mono">5</button>
         <button className="border px-2 py-0.5 rounded font-source-han">{'>'}</button>
         <span className="font-source-han">前往 <input className="w-8 border text-center font-mono"/> 页</span>
       </div>
    </div>
  );
};

// 10. 待入单库视图
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
             <div className="flex items-center gap-2 col-span-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">订单号/手机号/客户名称</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-source-han" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">订单来源</span><select className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-source-han"><option>请选择</option></select></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">地域</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-source-han" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">服务项目</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-source-han" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">状态</span><select className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-source-han"><option>请选择</option></select></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">地址</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-source-han" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">工作机</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-mono" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2 col-span-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">创建时间</span><input type="date" className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-mono" /><span className="text-xs font-source-han">-</span><input type="date" className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-mono" /></div>
             <div className="col-span-2 flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">是否刷单</span><select className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-source-han"><option>请选择</option></select></div>
             <div className="col-span-1 flex gap-2">
                <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs w-full font-source-han">搜索</button>
                <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs w-full font-source-han">重置</button>
             </div>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr className="font-source-han">
              {['序号','订单号','创建时间','手机号码','项目','状态','地域','地址','详细描述','订单来源','工作机','客户名称','客户备注','是否刷单','取消原因','取消详情','操作'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
             {data.map((row, i) => (
               <tr key={row.id} className="even:bg-[#FFF0F0] hover:bg-red-50 transition-colors">
                 <td className="px-3 py-2 text-center font-mono">{row.id}</td>
                 <td className="px-3 py-2 text-blue-600 font-mono">{row.orderNo}</td>
                 <td className="px-3 py-2 whitespace-nowrap font-mono">{row.createTime}</td>
                 <td className="px-3 py-2 font-mono">{row.mobile}</td>
                 <td className="px-3 py-2 font-source-han">{row.item}</td>
                 <td className="px-3 py-2 font-source-han">{row.status}</td>
                 <td className="px-3 py-2 font-source-han">{row.region}</td>
                 <td className="px-3 py-2 max-w-[100px] truncate font-source-han" title={row.address}>{row.address}</td>
                 <td className="px-3 py-2 max-w-[100px] truncate font-source-han" title={row.detail}>{row.detail}</td>
                 <td className="px-3 py-2 font-source-han">{row.source}</td>
                 <td className="px-3 py-2 font-mono">{row.workPhone}</td>
                 <td className="px-3 py-2 font-source-han">{row.clientName}</td>
                 <td className="px-3 py-2 font-source-han">{row.clientRemark}</td>
                 <td className="px-3 py-2 font-source-han">{row.isFake}</td>
                 <td className="px-3 py-2 font-source-han">{row.cancelReason}</td>
                 <td className="px-3 py-2 font-source-han">{row.cancelDetail}</td>
                 <td className="px-3 py-2 text-blue-600 cursor-pointer font-source-han">操作</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-slate-500 px-2 flex justify-center gap-2 items-center">
         <span className="font-source-han">共 <span className="font-mono">0</span> 条</span>
         <select className="border text-xs font-mono"><option>10条/页</option></select>
         <button className="border px-2 py-0.5 bg-blue-500 text-white rounded font-source-han">1</button>
         <button className="border px-2 py-0.5 rounded font-source-han">{'>'}</button>
         <span className="font-source-han">前往 <input className="w-8 border text-center font-mono"/> 页</span>
       </div>
    </div>
  );
};

// 11. 单库视图
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
             <div className="flex items-center gap-2 col-span-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">订单号/手机号</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-mono" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">分机号</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-mono" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">创建人</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-source-han" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">录单人</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-source-han" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">地域</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-source-han" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">地址</span><input className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-source-han" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">来源</span><select className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-source-han"><option>请选择</option></select></div>
             <div className="flex items-center gap-2 col-span-2"><span className="text-xs text-slate-500 whitespace-nowrap font-source-han">报名时间</span><input type="date" className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-mono" /><span className="text-xs font-source-han">-</span><input type="date" className="h-7 w-full border border-blue-200 rounded px-2 text-xs font-mono" /></div>
             <div className="col-span-1 flex gap-2">
                <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs w-full font-source-han">搜索</button>
                <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs w-full font-source-han">重置</button>
             </div>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr className="font-source-han">
              {['序号','是否有效','是否可视','是否派打','录单时间','报名时间','状态','地域','详细地址','详情','来源','工作机','录单员','派单员','师傅','师傅id','作废时间','作废原因','撤销原因','撤销时间','派单时间','总收款','成本','业绩','实付金额','垫付金额','备注','完工收入','客服备注','操作'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
             {data.map((row, i) => (
               <tr key={row.id} className="even:bg-[#FFF0F0] hover:bg-red-50 transition-colors">
                 <td className="px-3 py-2 text-center font-mono">{row.id}</td>
                 <td className="px-3 py-2 font-source-han">{row.isValid}</td>
                 <td className="px-3 py-2 font-source-han">{row.isVisible}</td>
                 <td className="px-3 py-2 font-source-han">{row.isCalled}</td>
                 <td className="px-3 py-2 whitespace-nowrap font-mono">{row.recordTime}</td>
                 <td className="px-3 py-2 whitespace-nowrap font-mono">{row.signupTime}</td>
                 <td className="px-3 py-2 font-source-han">{row.status}</td>
                 <td className="px-3 py-2 font-source-han">{row.region}</td>
                 <td className="px-3 py-2 max-w-[100px] truncate font-source-han" title={row.address}>{row.address}</td>
                 <td className="px-3 py-2 max-w-[100px] truncate font-source-han" title={row.detail}>{row.detail}</td>
                 <td className="px-3 py-2 font-source-han">{row.source}</td>
                 <td className="px-3 py-2 font-mono">{row.workPhone}</td>
                 <td className="px-3 py-2 font-source-han">{row.recorder}</td>
                 <td className="px-3 py-2 font-source-han">{row.dispatcher}</td>
                 <td className="px-3 py-2 font-source-han">{row.master}</td>
                 <td className="px-3 py-2 font-mono">{row.masterId}</td>
                 <td className="px-3 py-2 font-mono">{row.voidTime}</td>
                 <td className="px-3 py-2 font-source-han">{row.voidReason}</td>
                 <td className="px-3 py-2 font-source-han">{row.revokeReason}</td>
                 <td className="px-3 py-2 font-mono">{row.revokeTime}</td>
                 <td className="px-3 py-2 whitespace-nowrap font-mono">{row.dispatchTime}</td>
                 <td className="px-3 py-2 font-mono">{row.total}</td>
                 <td className="px-3 py-2 font-mono">{row.cost}</td>
                 <td className="px-3 py-2 font-mono">{row.revenue}</td>
                 <td className="px-3 py-2 font-mono">{row.paid}</td>
                 <td className="px-3 py-2 font-mono">{row.deposit}</td>
                 <td className="px-3 py-2 font-source-han">{row.remark}</td>
                 <td className="px-3 py-2 font-mono">{row.finishIncome}</td>
                 <td className="px-3 py-2 font-source-han">{row.csRemark}</td>
                 <td className="px-3 py-2 text-blue-600 cursor-pointer font-source-han">详情</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-slate-500 px-2 flex justify-center gap-2 items-center">
         <span className="font-source-han">共 <span className="font-mono">0</span> 条</span>
         <select className="border text-xs font-mono"><option>10条/页</option></select>
         <button className="border px-2 py-0.5 bg-blue-500 text-white rounded font-source-han">1</button>
         <button className="border px-2 py-0.5 rounded font-mono">2</button>
         <button className="border px-2 py-0.5 rounded font-source-han">{'>'}</button>
         <span className="font-source-han">前往 <input className="w-8 border text-center font-mono"/> 页</span>
       </div>
    </div>
  );
};

// 12. 微信收款视图
const WeChatCollectionView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generateWeChatCollectionData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-2">
         <DataOverview items={[{ label: '微信总收款', value: '¥ 12300.00' }, { label: '线下总收款', value: '¥ 5000.00' }]} />
      </div>
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)} extraButtons={<button className="bg-green-600 text-white px-3 py-1 text-xs rounded font-source-han">微信对账</button>}>
         <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">创建时间</span><input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs font-mono" /> <span className="text-xs font-source-han">-</span> <input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs font-mono" /></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs font-source-han">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs font-source-han">重置</button>
         </div>
      </FilterContainer>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr className="font-source-han">
              {['序号','派单员','微信总收款','线下派单线下总收款','其它收款'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
             {data.map((row, i) => (
               <tr key={row.id} className="even:bg-[#FFF0F0] hover:bg-red-50 transition-colors">
                 <td className="px-3 py-2 text-center font-mono">{row.id}</td>
                 <td className="px-3 py-2 font-source-han">{row.dispatcher}</td>
                 <td className="px-3 py-2 font-bold text-orange-600 font-mono">{row.wechatTotal}</td>
                 <td className="px-3 py-2 font-mono">{row.offlineTotal}</td>
                 <td className="px-3 py-2 font-mono">{row.otherTotal}</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 13. 订单收款视图
const OrderPaymentView = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const data = generatePaymentData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterContainer isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}>
         <div className="flex flex-wrap gap-3 items-center">
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">订单号/手机号</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-32 font-mono" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">派单员</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-24 font-source-han" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">核销券</span><input className="h-7 border border-blue-200 rounded px-2 text-xs w-24 font-source-han" placeholder="请输入内容" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">收款记录时间</span><input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs font-mono" /> <span className="text-xs font-source-han">-</span> <input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs font-mono" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">收款方式</span><select className="h-7 border border-blue-200 rounded px-2 text-xs w-24 font-source-han"><option>请选择</option></select></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">派单类型</span><select className="h-7 border border-blue-200 rounded px-2 text-xs w-24 font-source-han"><option>请选择</option></select></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">验券时间</span><input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs font-mono" /> <span className="text-xs font-source-han">-</span> <input type="date" className="h-7 border border-blue-200 rounded px-2 text-xs font-mono" /></div>
             <div className="flex items-center gap-2"><span className="text-xs text-slate-500 font-source-han">验券状态</span><select className="h-7 border border-blue-200 rounded px-2 text-xs w-24 font-source-han"><option>请选择</option></select></div>
             <button className="h-7 px-4 bg-blue-600 text-white rounded text-xs ml-auto font-source-han">搜索</button>
             <button className="h-7 px-4 bg-white border border-slate-300 text-slate-600 rounded text-xs font-source-han">重置</button>
         </div>
      </FilterContainer>
      
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b">
            <tr className="font-source-han">
              {['序号','订单号','派单员','完成时间','收款记录时间','手机号','收款金额','收款方式','核销券','验券状态','门店名称','验券金额','验券时间','验券失败原因','备注','创建人'].map(h => (
                <th key={h} className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
             {data.map((row, i) => (
               <tr key={row.id} className="even:bg-[#FFF0F0] hover:bg-red-50 transition-colors">
                 <td className="px-3 py-2 text-center font-mono">{row.id}</td>
                 <td className="px-3 py-2 text-blue-600 font-mono">{row.orderNo}</td>
                 <td className="px-3 py-2 font-source-han">{row.dispatcher}</td>
                 <td className="px-3 py-2 font-mono">{row.finishTime}</td>
                 <td className="px-3 py-2 font-mono">{row.payRecordTime}</td>
                 <td className="px-3 py-2 font-mono">{row.mobile}</td>
                 <td className="px-3 py-2 font-bold text-orange-600 font-mono">¥{row.amount}</td>
                 <td className="px-3 py-2 font-source-han">{row.method}</td>
                 <td className="px-3 py-2 text-center font-source-han">{row.coupon}</td>
                 <td className="px-3 py-2 text-center font-source-han">{row.verifyStatus === '已核销' ? <span className="text-green-600">已核销</span> : <span className="text-gray-400">未核销</span>}</td>
                 <td className="px-3 py-2 font-source-han">{row.storeName}</td>
                 <td className="px-3 py-2 font-mono">{row.verifyAmount}</td>
                 <td className="px-3 py-2 font-mono">{row.verifyTime}</td>
                 <td className="px-3 py-2 text-center font-source-han">{row.failReason}</td>
                 <td className="px-3 py-2 font-source-han">{row.remark}</td>
                 <td className="px-3 py-2 font-source-han">{row.creator}</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
       <div className="mt-2 text-xs font-bold text-slate-700 px-2 font-source-han">收款合计: <span className="font-mono">¥ 2450.00</span> &nbsp;&nbsp; 订单总数 (已去重): <span className="font-mono">20</span></div>
    </div>
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

  // ... [Keep handlers] ...
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
                    {/* ... header rows ... */}
                    <tr className="bg-slate-50 border-b-2 border-gray-300 text-base font-bold uppercase text-slate-700 tracking-wider font-source-han">
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
                      
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">质保期</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">工作机</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">客户姓名</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">派单员</th>
                      <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">录单员</th>
                      
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
                  {/* Updated main table tbody to match the requested style */}
                  <tbody className="divide-y divide-slate-300">
                    {currentData.map((order, index) => (
                      <tr key={order.id} onMouseLeave={handleMouseEnterOther} className="bg-white even:bg-[#FFF0F0] hover:!bg-yellow-50 transition-colors group border-b border-slate-300 last:border-0 align-middle">
                        
                        {/* ... table cells ... */}
                        <td className="px-2 py-2 text-slate-800 font-bold text-[12px] tabular-nums whitespace-nowrap align-middle text-center font-mono" onMouseEnter={handleMouseEnterOther}>{order.mobile}</td>
                        
                        <td className="px-2 py-2 align-middle whitespace-nowrap" onMouseEnter={handleMouseEnterOther}>
                          <ServiceItemCell item={order.serviceItem} warranty={order.warrantyPeriod} />
                        </td>
                        
                        <td className="px-2 py-2 align-middle" onMouseEnter={() => setHoveredTooltipCell({rowId: order.id, colKey: 'service'})}>
                          <StatusCell order={order} />
                        </td>

                        <td className="px-2 py-2 text-center align-middle" onMouseEnter={handleMouseEnterOther}>
                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold text-[13px] font-mono">{order.weightedCoefficient.toFixed(1)}</span>
                        </td>

                        <td className="px-2 py-2 text-slate-700 whitespace-nowrap align-middle text-center text-[12px] font-source-han" onMouseEnter={handleMouseEnterOther}>
                            <div className="relative pr-8 inline-block"> 
                                {order.region}
                                <span className="absolute bottom-0 right-0 text-[9px] text-blue-600 border border-blue-200 bg-blue-50 px-1 rounded font-mono">
                                  {order.regionPeople}人
                                </span>
                            </div>
                        </td>
                        
                        <td className="px-2 py-2 align-middle" onMouseEnter={() => setHoveredTooltipCell({rowId: order.id, colKey: 'address'})}>
                          <TooltipCell content={order.address} maxWidthClass="max-w-[120px]" showTooltip={hoveredTooltipCell?.rowId === order.id && hoveredTooltipCell?.colKey === 'address'} />
                        </td>
                        
                        <td className="px-2 py-2 align-middle" onMouseEnter={() => setHoveredTooltipCell({rowId: order.id, colKey: 'details'})}>
                          <TooltipCell content={order.details} maxWidthClass="max-w-[140px]" showTooltip={hoveredTooltipCell?.rowId === order.id && hoveredTooltipCell?.colKey === 'details'} />
                        </td>
                        
                        <td className="px-2 py-2 text-center align-middle font-medium text-slate-600 text-[14px] font-mono" onMouseEnter={handleMouseEnterOther}>
                           {order.serviceRatio}
                        </td>
                        
                        <td className="px-2 py-2 text-center align-middle" onMouseEnter={handleMouseEnterOther}>
                           <span className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px] text-gray-600 whitespace-nowrap font-source-han">{order.suggestedMethod}</span>
                        </td>

                        <td className="px-2 py-2 text-center align-middle font-medium text-slate-600 text-[13px] font-mono" onMouseEnter={handleMouseEnterOther}>
                           {formatCurrency(order.guidePrice)}
                        </td>

                        <td className="px-2 py-2 text-center align-middle font-medium text-slate-600 text-[13px] font-mono" onMouseEnter={handleMouseEnterOther}>
                           {order.historicalPrice}
                        </td>

                        <td className="px-2 py-2 align-middle text-center" onMouseEnter={handleMouseEnterOther}><span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[11px] border border-slate-200 whitespace-nowrap font-medium font-source-han">{order.source}</span></td>
                        
                        <td className="px-2 py-2 align-middle" onMouseEnter={handleMouseEnterOther}>
                            <CombinedIdCell orderNo={order.orderNo} workOrderNo={order.workOrderNo} hasAdvancePayment={order.hasAdvancePayment} depositAmount={order.depositAmount} />
                        </td>

                        <td className="px-2 py-2 align-middle" onMouseEnter={handleMouseEnterOther}>
                            <CombinedTimeCell recordTime={order.recordTime} dispatchTime={order.dispatchTime} />
                        </td>

                        <td className="px-2 py-2 align-middle text-center" onMouseEnter={handleMouseEnterOther}>
                            <button className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"><Search size={14} /></button>
                        </td>

                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-source-han">{order.hasCoupon ? <Check size={14} className="text-green-500 mx-auto"/> : <span className="text-gray-300">-</span>}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-source-han">{order.isCouponVerified ? <span className="text-green-600 font-bold text-[13px]">是</span> : <span className="text-gray-400 text-[13px]">否</span>}</td>
                        
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-source-han">
                            {order.isRead ? <span className="text-gray-400 text-[12px]">已读</span> : <span className="text-orange-500 text-[12px]">未读</span>}
                        </td>
                        
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-source-han">
                            {order.isCalled ? <span className="text-gray-400 text-[12px]">已拨打</span> : <span className="text-orange-500 text-[12px]">未拨打</span>}
                        </td>
                        
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-600 text-[13px] font-source-han">{order.warrantyPeriod}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-600 text-[13px] font-mono">{order.workPhone}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-700 font-medium text-[13px] font-source-han">{order.customerName}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-600 text-[13px] font-source-han">{order.dispatcherName}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-600 text-[13px] font-source-han">{order.recorderName}</td>
                        
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap">
                            <div className="flex flex-col items-center">
                                <span className="text-slate-700 font-medium text-[13px] font-source-han">{order.masterName}</span>
                                <span className="text-slate-400 text-[11px] font-mono">{order.masterPhone}</span>
                            </div>
                        </td>
                        
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-emerald-600 font-bold text-[13px]">{formatCurrency(order.totalReceipt)}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-slate-500 text-[13px]">{formatCurrency(order.cost)}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-orange-600 font-bold text-[13px]">{formatCurrency(order.revenue)}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-slate-700 text-[13px]">{formatCurrency(order.actualPaid)}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-slate-700 text-[13px]">{formatCurrency(order.advancePaymentAmount)}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-slate-700 text-[13px]">{formatCurrency(order.otherReceipt)}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-slate-700 text-[13px]">{formatCurrency(order.completionIncome)}</td>
                        
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-[12px] text-slate-500 font-mono">{order.serviceTime || '-'}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-[12px] text-slate-500 font-mono">{order.completionTime || '-'}</td>
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-[12px] text-slate-500 font-mono">{order.paymentTime || '-'}</td>
                        
                        <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-500 text-[12px] font-source-han">{order.voiderNameAndReason || '-'}</td>
                        <td className="px-2 py-2 align-middle whitespace-nowrap"><TooltipCell content={order.voidDetails || '-'} maxWidthClass="max-w-[150px]" showTooltip={false} /></td>
                        <td className="px-2 py-2 align-middle whitespace-nowrap"><TooltipCell content={order.cancelReasonAndDetails || '-'} maxWidthClass="max-w-[150px]" showTooltip={false} /></td>
                        <td className="px-2 py-2 align-middle whitespace-nowrap text-slate-500 text-[12px] font-source-han">{order.favoriteRemark || '-'}</td>


                        {/* --- 固定列 (联系人, 催单, 操作) --- */}
                        <td className="px-2 py-2 align-middle text-center sticky-col sticky-right-contact sticky-bg-solid" onMouseEnter={handleMouseEnterOther}>
                          <div className="grid grid-cols-2 gap-2 justify-items-center w-fit mx-auto">
                            <button onClick={() => handleOpenChat('派单员', order)} className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-all shadow-sm hover:scale-105" title="派单员">
                                <Headset size={12} strokeWidth={2} />
                            </button>
                            <button onClick={() => handleOpenChat('运营', order)} className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition-all shadow-sm hover:scale-105" title="运营">
                                <User size={12} strokeWidth={2} />
                            </button>
                            <button onClick={() => handleOpenChat('售后', order)} className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-all shadow-sm hover:scale-105" title="售后">
                                <MessageCircle size={12} strokeWidth={2} />
                            </button>
                            <button onClick={() => handleOpenChat('群聊', order)} className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 transition-all shadow-sm hover:scale-105" title="群聊">
                                <Phone size={12} strokeWidth={2} />
                            </button>
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
        /* 0. 字体设置 */
        @font-face {
          font-family: 'Source Han Sans CN';
          font-style: normal;
          font-weight: 400;
          src: local('Source Han Sans CN Regular'), local('SourceHanSansCN-Regular');
        }
        .font-source-han {
          font-family: 'Source Han Sans CN', 'Microsoft YaHei', sans-serif !important;
        }

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
          background-color: #FFF0F0 !important; /* Fixed Sticky col alternating color */
        }
        tr:hover td.sticky-bg-solid {
          background-color: #FEFCE8 !important; /* Yellow hover for sticky cells */
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