"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { useMutation, useQuery } from "@/lib/apollo/hooks"
import UploadBox from "@/components/UploadBox"
import {
  EVENT_BY_ID_QUERY,
  UPDATE_EVENT_MUTATION,
} from "@/lib/graphql/operations"
import { getUploadUrl } from "@/lib/graphql/server"

const EventSchema = Yup.object({
  title: Yup.string().required("Event title is required"),
  startDate: Yup.date().required("Start date is required"),
  endDate: Yup.date()
    .min(Yup.ref("startDate"), "End date must be after start date")
    .required("End date is required"),
  description: Yup.string().required("Description is required"),
})

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data, loading } = useQuery(EVENT_BY_ID_QUERY, {
    variables: { id },
    skip: !id,
  })

  const [updateEvent, { loading: saving }] = useMutation(UPDATE_EVENT_MUTATION)

  const [initialValues, setInitialValues] = useState<{
    title: string
    logoUrl: string
    bannerUrl: string
    startDate: string
    endDate: string
    location: string
    websiteUrl: string
    registerUrl: string
    calendarUrl: string
    description: string
  } | null>(null)

  useEffect(() => {
    const event = data?.eventById
    if (!event) return

    setInitialValues({
      title: event.title || "",
      logoUrl: event.logoUrl || "",
      bannerUrl: event.bannerUrl || "",
      startDate: event.startDate?.slice(0, 10),
      endDate: event.endDate?.slice(0, 10),
      location: event.location || "",
      websiteUrl: event.websiteUrl || "",
      registerUrl: event.registerUrl || "",
      calendarUrl: event.calendarUrl || "",
      description: event.description || "",
    })
  }, [data])

  const uploadImage = async (
    file: File,
    setFieldValue: (field: string, value: string) => void,
    fieldName: "logoUrl" | "bannerUrl"
  ) => {
    const formData = new FormData()
    formData.append("image", file)

    const res = await fetch(getUploadUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    })

    if (!res.ok) {
      alert("Upload failed")
      return
    }

    const data = await res.json()
    setFieldValue(fieldName, data.imageUrl)
  }

  const handleSubmit = async (values: NonNullable<typeof initialValues>) => {
    try {
      await updateEvent({
        variables: {
          id,
          input: {
            ...values,
            logoUrl: values.logoUrl || undefined,
            bannerUrl: values.bannerUrl || undefined,
            websiteUrl: values.websiteUrl || undefined,
            registerUrl: values.registerUrl || undefined,
            calendarUrl: values.calendarUrl || undefined,
            location: values.location || undefined,
          },
        },
      })
      router.push("/admin/events")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update event")
    }
  }

  if (loading || !initialValues) {
    return <p className="p-6">Loading event...</p>
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={EventSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, values, isSubmitting }) => (
          <Form className="space-y-6">
            <div>
              <Field name="title" className="input" />
              <ErrorMessage name="title" component="p" className="error" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UploadBox
                label="Event Logo"
                value={values.logoUrl}
                onUpload={(file) => uploadImage(file, setFieldValue, "logoUrl")}
              />
              <UploadBox
                label="Event Banner"
                value={values.bannerUrl}
                onUpload={(file) => uploadImage(file, setFieldValue, "bannerUrl")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field type="date" name="startDate" className="input" />
              <Field type="date" name="endDate" className="input" />
            </div>

            <Field name="location" placeholder="Location" className="input" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field name="websiteUrl" placeholder="Website URL" className="input" />
              <Field name="registerUrl" placeholder="Register URL" className="input" />
            </div>

            <Field name="calendarUrl" placeholder="Add to Calendar URL" className="input" />

            <div>
              <Field as="textarea" name="description" rows={6} className="input" />
              <ErrorMessage name="description" component="p" className="error" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || saving}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              {isSubmitting || saving ? "Updating..." : "Update Event"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  )
}
