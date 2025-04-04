import { AxiosInstance } from "../utils/api.js";
import { ENDPOINTS } from "../config/config.js";

export const sendMailApiRequest = async (
  to: string[],
  data: ResultsForUI[]
) => {
  const response = await AxiosInstance.post(ENDPOINTS.SEND_MAIL, {
    email: {
      email: to,
    },
    data,
  });
  return response.data;
};

// export const sendMail = async (
//   to: string,
//   subject: string,
//   data: ResultsForUI[]
// ) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL,
//       pass: process.env.APP_PASSWORD,
//     },
//   });

//   const mailOptions = {
//     from: `Plant Disease Monitoring System <${process.env.EMAIL}>`,
//     to,
//     subject,
//     html: `
//     <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f7fa;">
//       <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden;">

//         <div style="background: linear-gradient(135deg, #2196f3, #1976d2); padding: 15px; text-align: center;">
//           <h2 style="color: white; margin: 0; font-size: 20px; letter-spacing: 0.5px;">
//             🚨 Plant Disease Detection Alert
//           </h2>
//           <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 13px;">
//             Our system has detected potential disease conditions
//           </p>
//         </div>

//         <div style="padding: 10px;">
//           ${data
//             .filter((item) => item.hasDisease)
//             .map(
//               (item) => `
//                 <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 15px; border: 1px solid #e9ecef; text-align: center;">

//                   <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
//                     <span style="display: flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #2196f3, #1976d2); color: white; padding: 6px 12px; border-radius: 50px; font-size: 13px; font-weight: 500;">
//                       📸 &nbsp;  Camera ${item?.camera || "Unknown"}
//                     </span>
//                     &nbsp; &nbsp;
//                     ${
//                       item?.cameraData?.bedNumber
//                         ? `<span style="display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #673ab7, #5e35b1); color: white; padding: 6px 12px; border-radius: 50px; font-size: 13px; font-weight: 500;">
//                             🌱 &nbsp; Bed #${item.cameraData.bedNumber}
//                            </span>`
//                         : ""
//                     }
//                   </div>

//                   <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
//                     <h3 style="display: flex; align-items: center; justify-content: center; gap: 6px; color: #1a237e; margin: 0 0 8px 0; font-size: 16px;">
//                       <span>👨‍🌾</span> &nbsp; &nbsp;
//                       <span style="font-weight: 600;">${
//                         item?.cameraData?.farmer || "Unknown Farmer"
//                       }</span>
//                     </h3>

//                     <div style="display: flex; align-items: center; justify-content: center; gap: 6px; color: #424242; font-size: 14px;">
//                       <span>🌶️</span> &nbsp; &nbsp;
//                       <span style="font-weight: 600;">${
//                         item?.cameraData?.chilliName || "Unknown Plant"
//                       }</span>
//                       &nbsp; &nbsp;
//                       <span style="background: #e3f2fd; padding: 3px 10px; border-radius: 50px; font-size: 12px; color: #1976d2;">
//                         ${item?.cameraData?.chilliCode || "No Code"}
//                       </span>
//                     </div>
//                   </div>

//                   <div style="background: white; border-radius: 8px; padding: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
//                     <h4 style="display: flex; align-items: center; justify-content: center; gap: 6px; color: #c62828; margin: 0 0 12px 0; font-size: 15px;">
//                       <span>⚠️</span> &nbsp; &nbsp;
//                       <span style="font-weight: 600;">Detected Diseases</span>
//                     </h4>

//                     ${
//                       item.diseaseTypes
//                         ?.map(
//                           (disease) => `
//                           <div style="display: flex; gap: 10px; justify-content: space-between; align-items: center; padding: 8px; background: ${
//                             disease.score > 85 ? "#fff5f5" : "#fff8e1"
//                           }; border-radius: 6px; margin-bottom: 6px;">
//                             <span style="text-transform: capitalize; color: #424242; font-size: 13px; font-weight: 500;">
//                               🔍 ${disease.label} &nbsp; &nbsp;
//                             </span>
//                             <span style="background: ${
//                               disease.score > 85
//                                 ? "linear-gradient(135deg, #d32f2f, #c62828)"
//                                 : "linear-gradient(135deg, #f57c00, #ef6c00)"
//                             }; color: white; padding: 4px 10px; border-radius: 50px; font-size: 12px; font-weight: 500;">
//                               ${(disease.score * 100).toFixed(2)}%
//                             </span>
//                           </div>`
//                         )
//                         .join("") ||
//                       '<p style="color: #666; font-style: italic; margin: 0; font-size: 13px; text-align: center;">No diseases detected</p>'
//                     }
//                   </div>
//                 </div>
//               `
//             )
//             .join("")}
//         </div>

//         <div style="padding: 12px; text-align: center; border-top: 1px solid #eee; background: #fafafa;">
//           <p style="color: #666; font-size: 12px; margin: 0; line-height: 1.4;">
//             🤖 This is an automated alert from your Plant Disease Monitoring System<br>
//             Please review the findings and take appropriate action if necessary
//           </p>
//         </div>

//       </div>
//     </div>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// };
