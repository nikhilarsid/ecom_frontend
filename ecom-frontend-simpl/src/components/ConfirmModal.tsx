// import styled from "styled-components";
// import { AlertTriangle, X } from "lucide-react";

// const Overlay = styled.div`
//   position: fixed;
//   inset: 0;
//   background: rgba(0, 0, 0, 0.7);
//   backdrop-filter: blur(8px);
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   z-index: 9999;
// `;

// const ModalCard = styled.div`
//   background: white;
//   padding: 40px;
//   border-radius: 32px;
//   max-width: 400px;
//   width: 90%;
//   text-align: center;
//   position: relative;
//   box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
// `;

// const ConfirmButton = styled.button`
//   background: #000;
//   color: white;
//   padding: 16px;
//   border-radius: 16px;
//   font-weight: 900;
//   text-transform: uppercase;
//   font-size: 12px;
//   width: 100%;
//   margin-top: 24px;
//   transition: transform 0.2s;
//   &:hover { transform: scale(0.98); }
// `;

// export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
//   if (!isOpen) return null;

//   return (
//     <Overlay>
//       <ModalCard>
//         <div className="flex justify-center mb-6">
//           <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
//             <AlertTriangle size={32} />
//           </div>
//         </div>
//         <h3 className="text-xl font-black uppercase mb-2">Are you sure?</h3>
//         <p className="text-zinc-500 text-sm leading-relaxed">{message}</p>
        
//         <ConfirmButton onClick={onConfirm}>
//           Yes, Proceed
//         </ConfirmButton>
        
//         <button 
//           onClick={onCancel}
//           className="mt-4 text-xs font-bold uppercase text-zinc-400 tracking-widest hover:text-black"
//         >
//           Cancel
//         </button>
//       </ModalCard>
//     </Overlay>
//   );
// }