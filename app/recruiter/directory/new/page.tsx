"use client"

import { useRouter } from "next/navigation"
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik"
import * as Yup from "yup"
import RichTextEditor from "@/components/RichTextField"
import UploadBox from "@/components/UploadBox"
import { useState, useEffect } from "react"
import { useApolloClient, useMutation, useQuery } from "@/lib/apollo/hooks"
import { loadGeo } from "@/lib/geo"
import PackageLimitModal from "@/components/recruiter/PackageLimitModal"
import {
  fetchProductListingEligibility,
  type ContentLimitEligibility,
} from "@/lib/packageLimits"
import { getUploadUrl } from "@/lib/graphql/server"
import {
  CREATE_SUPPLIER_DIRECTORY_MUTATION,
  INDUSTRIES_QUERY,
  INDUSTRY_CHILDREN_QUERY,
} from "@/lib/graphql/operations"

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

/* ---------------- VALIDATION ---------------- */
const DirectorySchema = Yup.object({
  name: Yup.string().min(3).required("Company name is required"),
  slug: Yup.string()
    .matches(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens")
    .required("Slug is required"),
  phoneNumber: Yup.string().required("Phone number is required"),
  email: Yup.string().email().required("Email is required"),
  description: Yup.string().min(20).required("Description is required"),

  website: Yup.string().url().nullable(),
  logoUrl: Yup.string().url().nullable(),
  coverImageUrl: Yup.string().url().nullable(),

  tradeNames: Yup.array().of(Yup.string()).min(1),
  videoGallery: Yup.array().of(Yup.string().url()),
  productSupplies: Yup.array().of(Yup.string().min(2)),

  socialLinks: Yup.object({
    facebook: Yup.string().url().nullable(),
    linkedin: Yup.string().url().nullable(),
    twitter: Yup.string().url().nullable(),
    youtube: Yup.string().url().nullable(),
  }),

  // ✅ NEW FIELDS
  country: Yup.string().required("Country required"),
  state: Yup.string().required("State required"),
  city: Yup.string().required("City required"),
  address: Yup.string().min(10).required("Address required"),
  industryId: Yup.string().required("Industry required"),
})

export default function AddDirectoryPage() {
  const router = useRouter()
  const client = useApolloClient()
  const { data: industriesData } = useQuery(INDUSTRIES_QUERY)
  const [createDirectory] = useMutation(CREATE_SUPPLIER_DIRECTORY_MUTATION)

  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [listingEligibility, setListingEligibility] =
    useState<ContentLimitEligibility | null>(null)
  const [showLimitModal, setShowLimitModal] = useState(false)

  useEffect(() => {
    async function loadEligibility() {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        setListingEligibility(await fetchProductListingEligibility(token))
      } catch (error) {
        console.error("Product listing eligibility error:", error)
      }
    }
    loadEligibility()
  }, [])

  /* ================= INDUSTRY CASCADE ================= */
  type IndustryOption = { id: string; name: string; parentId?: string | null }
  const [industryLevels, setIndustryLevels] = useState<IndustryOption[][]>([])
  const [industrySelected, setIndustrySelected] = useState<string[]>([])
  const [geo, setGeo] = useState<Awaited<ReturnType<typeof loadGeo>> | null>(null)

  useEffect(() => {
    loadGeo().then(setGeo).catch(console.error)
  }, [])

  useEffect(() => {
    const roots =
      industriesData?.industries?.filter((i: IndustryOption) => !i.parentId) ?? []
    if (roots.length > 0) {
      setIndustryLevels([roots])
    }
  }, [industriesData])

  const handleIndustrySelect = async (
    levelIndex: number,
    id: string,
    setFieldValue: (field: string, value: string) => void
  ) => {
    const newSelected = [...industrySelected.slice(0, levelIndex), id]
    const newLevels = industryLevels.slice(0, levelIndex + 1)

    setIndustrySelected(newSelected)
    setIndustryLevels(newLevels)
    setFieldValue("industryId", "")

    const { data: childData } = await client.query<{ industryChildren: IndustryOption[] }>({
      query: INDUSTRY_CHILDREN_QUERY,
      variables: { parentId: id },
    })
    const children: IndustryOption[] = childData?.industryChildren ?? []

    if (children.length > 0) {
      setIndustryLevels([...newLevels, children])
    } else {
      setFieldValue("industryId", id)
    }
  }

  /* ================= IMAGE UPLOAD ================= */
  const handleImageUpload = async (
    file: File,
    setFieldValue: any,
    fieldName: "logoUrl" | "coverImageUrl",
    type: "logo" | "cover"
  ) => {
    if (type === "logo") setUploadingLogo(true)
    if (type === "cover") setUploadingCover(true)

    setUploadError("")

    try {
      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch(getUploadUrl(), { method: "POST", body: formData })

      if (!res.ok) throw new Error("Image upload failed")

      const data = await res.json()
      setFieldValue(fieldName, data.imageUrl)

    } catch (err: any) {
      setUploadError(err.message)
    } finally {
      if (type === "logo") setUploadingLogo(false)
      if (type === "cover") setUploadingCover(false)
    }
  }

  /* ================= SUBMIT ================= */
  async function submit(values: any, { setSubmitting, setStatus }: any) {
    try {
      const geoLib = geo ?? (await loadGeo())

      const selectedCountry = geoLib.Country.getAllCountries().find(
        c => c.isoCode === values.country
      )

      const selectedState = geoLib.State.getStatesOfCountry(values.country).find(
        s => s.isoCode === values.state
      )

      const location = [
        values.city,
        selectedState?.name,
        selectedCountry?.name,
      ].filter(Boolean).join(", ")

      const socialLinks = Object.fromEntries(
        Object.entries(values.socialLinks).filter(([, v]) => v)
      )

      await createDirectory({
        variables: {
          input: {
            name: values.name,
            slug: values.slug,
            phoneNumber: values.phoneNumber,
            email: values.email,
            description: values.description,
            website: values.website || undefined,
            logoUrl: values.logoUrl || undefined,
            coverImageUrl: values.coverImageUrl || undefined,
            tradeNames: values.tradeNames.filter(Boolean),
            videoGallery: values.videoGallery.filter(Boolean),
            productSupplies: values.productSupplies.filter(Boolean),
            socialLinks,
            location,
            address: values.address,
            industryId: values.industryId,
          },
        },
      })

      router.push("/recruiter/directories")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit directory"
      if (message.toLowerCase().includes("limit")) {
        setShowLimitModal(true)
        return
      }
      setStatus(message)
    } finally {
      setSubmitting(false)
    }
  }

  const countries = geo?.Country.getAllCountries() ?? []

  if (!geo) {
    return (
      <div className="max-w-3xl mx-auto p-10">
        <p className="text-gray-600">Loading form...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-10">
      <h1 className="text-2xl font-bold mb-2">
        Add Supplier Directory
      </h1>
      {listingEligibility && (
        <p className="text-sm text-gray-500 mb-6">
          {listingEligibility.isUnlimited
            ? "Your plan includes unlimited supplier directories."
            : `Directory slots: ${listingEligibility.activeListings ?? 0} of ${listingEligibility.effectiveLimit ?? 0} used · ${listingEligibility.remaining ?? 0} remaining (Free: 5 · Basic: 25 · Pro/Enterprise: Unlimited). Add as many products as you need inside each directory.`}
        </p>
      )}

      <Formik
        initialValues={{
          name: "",
          slug: "",
          phoneNumber: "",
          email: "",
          description: "",
          website: "",
          logoUrl: "",
          coverImageUrl: "",
          tradeNames: [""],
          videoGallery: [""],
          productSupplies: [""],
          socialLinks: {
            facebook: "",
            linkedin: "",
            twitter: "",
            youtube: "",
          },

          // NEW
          country: "",
          state: "",
          city: "",
          address: "",
          industryId: "",
        }}
        validationSchema={DirectorySchema}
        onSubmit={submit}
      >
        {({ isSubmitting, setFieldValue, values, status }) => {

          const states = values.country
            ? geo.State.getStatesOfCountry(values.country)
            : []

          const cities = values.state
            ? geo.City.getCitiesOfState(values.country, values.state)
            : []

          return (
           <Form className="space-y-6 bg-white p-6 rounded-xl shadow">

  {/* NAME + SLUG */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="label">Company Name</label>
      <Field
        name="name"
        className="input"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const val = e.target.value
          setFieldValue("name", val)
          setFieldValue("slug", slugify(val))
        }}
      />
      <ErrorMessage name="name" component="p" className="error" />
    </div>
    <div>
      <label className="label">Slug</label>
      <Field name="slug" className="input" />
      <ErrorMessage name="slug" component="p" className="error" />
    </div>
  </div>

  {/* PHONE + EMAIL */}
  <div className="grid grid-cols-2 gap-4">
    <FieldBlock label="Phone Number" name="phoneNumber" />
    <FieldBlock label="Email" name="email" />
  </div>

  {/* COUNTRY + STATE */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="label">Country</label>
      <Field as="select" name="country" className="input">
        <option value="">Select Country</option>
        {countries.map(c => (
          <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
        ))}
      </Field>
      <ErrorMessage name="country" component="p" className="error" />
    </div>
    <div>
      <label className="label">State</label>
      <Field as="select" name="state" className="input">
        <option value="">Select State</option>
        {states.map(s => (
          <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
        ))}
      </Field>
      <ErrorMessage name="state" component="p" className="error" />
    </div>
  </div>

  {/* CITY + ADDRESS */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="label">City</label>
      <Field as="select" name="city" className="input">
        <option value="">Select City</option>
        {cities.map(c => (
          <option key={c.name} value={c.name}>{c.name}</option>
        ))}
      </Field>
      <ErrorMessage name="city" component="p" className="error" />
    </div>
    <FieldBlock label="Full Address" name="address" />
  </div>

  {/* INDUSTRY + WEBSITE */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="label">Industry</label>
      {industryLevels.map((levelOptions, levelIndex) => (
        <select
          key={levelIndex}
          className="input mb-2"
          value={industrySelected[levelIndex] ?? ""}
          onChange={(e) =>
            handleIndustrySelect(levelIndex, e.target.value, setFieldValue)
          }
        >
          <option value="">Select Industry</option>
          {levelOptions.map((industry: any) => (
            <option key={industry.id} value={industry.id}>{industry.name}</option>
          ))}
        </select>
      ))}
      <ErrorMessage name="industryId" component="p" className="error" />
    </div>
    <FieldBlock label="Website" name="website" />
  </div>

  {/* DESCRIPTION - full width */}
  <div>
    <label className="label">Description</label>
    <RichTextEditor name="description" />
  </div>

  {/* IMAGE UPLOADS - full width */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <UploadBox
      label="Company Logo"
      value={values.logoUrl}
      onUpload={(file) =>
        handleImageUpload(file, setFieldValue, "logoUrl", "logo")
      }
    />
  </div>

  {/* PRODUCT SUPPLIES - full width */}
  <Section title="Product Supplies / Services">
    <p className="text-sm text-gray-500 mb-3">
      List the products or services in this directory. Package limits apply to
      how many supplier directories you can create, not how many products each
      contains.
    </p>
    <FieldArray name="productSupplies">
      {({ push, remove }) => (
        <>
          {values.productSupplies.map((_: any, i: number) => (
            <div key={i} className="flex gap-2">
              <Field name={`productSupplies.${i}`} className="input flex-1" />
              {i > 0 && <button type="button" onClick={() => remove(i)}>✕</button>}
            </div>
          ))}
          <button type="button" onClick={() => push("")}>
            + Add product
          </button>
        </>
      )}
    </FieldArray>
  </Section>

  {/* SOCIAL LINKS */}
  <Section title="Social Media Links">
    <div className="grid grid-cols-2 gap-4">
      <FieldBlock label="Facebook" name="socialLinks.facebook" />
      <FieldBlock label="LinkedIn" name="socialLinks.linkedin" />
      <FieldBlock label="Twitter" name="socialLinks.twitter" />
      <FieldBlock label="YouTube" name="socialLinks.youtube" />
    </div>
  </Section>

  {/* TRADE NAMES - full width */}
  <Section title="Trade Names">
    <FieldArray name="tradeNames">
      {({ push, remove }) => (
        <>
          {values.tradeNames.map((_: any, i: number) => (
            <div key={i} className="flex gap-2">
              <Field name={`tradeNames.${i}`} className="input flex-1" />
              {i > 0 && <button type="button" onClick={() => remove(i)}>✕</button>}
            </div>
          ))}
          <button type="button" onClick={() => push("")}>+ Add trade name</button>
        </>
      )}
    </FieldArray>
  </Section>

  {/* VIDEO GALLERY - full width */}
  <Section title="YouTube Video Gallery">
    <FieldArray name="videoGallery">
      {({ push, remove }) => (
        <>
          {values.videoGallery.map((_: any, i: number) => (
            <div key={i} className="flex gap-2">
              <Field name={`videoGallery.${i}`} className="input flex-1" />
              {i > 0 && <button type="button" onClick={() => remove(i)}>✕</button>}
            </div>
          ))}
          <button type="button" onClick={() => push("")}>+ Add video</button>
        </>
      )}
    </FieldArray>
  </Section>

  {status && <p className="text-red-600 text-sm">{status}</p>}

  <button
    type="submit"
    disabled={isSubmitting || uploadingLogo || uploadingCover}
    className="bg-black text-white px-6 py-2 rounded"
  >
    {isSubmitting ? "Submitting..." : "Submit for Approval"}
  </button>

</Form>
          )
        }}
      </Formik>

      <PackageLimitModal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        title="Directory slot limit reached"
        eligibility={listingEligibility}
        usedLabel="Directories"
        usedValue={listingEligibility?.activeListings}
        limitValue={listingEligibility?.effectiveLimit}
      />
    </div>
  )
}

/* HELPERS */
function FieldBlock({ label, name }: any) {
  return (
    <div>
      <label className="label">{label}</label>
      <Field name={name} className="input" />
      <ErrorMessage name={name} component="p" className="error" />
    </div>
  )
}

function Section({ title, children }: any) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}