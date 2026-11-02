import { fetchApi } from "../../../services/api"

export const contactService = {
  async sendInquiry(contactData) {
    return fetchApi("/contacto", {
      method: "POST",
      body: JSON.stringify(contactData),
    })
  },
}
