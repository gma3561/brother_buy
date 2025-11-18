// 브라더상품권 매입 신청 API
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PurchaseRequest {
  brand: string
  amount: number
  name: string
  phone: string
  account: string
  pin: string
  message?: string
}

serve(async (req) => {
  // CORS preflight 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabase 클라이언트 생성
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 요청 데이터 파싱
    const body: PurchaseRequest = await req.json()

    // 유효성 검사
    if (!body.brand || !body.amount || !body.name || !body.phone || !body.account || !body.pin) {
      return new Response(
        JSON.stringify({ error: '필수 항목이 누락되었습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PIN 번호 검증 (16자리 숫자)
    const pin = body.pin.replace(/\D/g, '')
    if (pin.length !== 16) {
      return new Response(
        JSON.stringify({ error: 'PIN 번호는 16자리 숫자여야 합니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 브랜드 정보 조회
    const { data: brandData, error: brandError } = await supabase
      .from('giftcard_brands')
      .select('id, buy_rate')
      .eq('brand_code', body.brand)
      .eq('is_active', true)
      .single()

    if (brandError || !brandData) {
      return new Response(
        JSON.stringify({ error: '유효하지 않은 상품권 브랜드입니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 입금액 계산 (상품권 금액 * 매입율)
    const paymentAmount = Math.floor(body.amount * brandData.buy_rate / 100)

    // PIN 번호 암호화 (실제로는 더 강력한 암호화 필요)
    // 여기서는 간단히 Base64 인코딩 사용 (실제 운영시 AES-256 등 사용)
    const pinEncrypted = btoa(pin)

    // 클라이언트 정보 수집
    const ipAddress = req.headers.get('x-forwarded-for') ||
                      req.headers.get('x-real-ip') ||
                      'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // 매입 신청 저장
    const { data: purchaseData, error: purchaseError } = await supabase
      .from('purchase_requests')
      .insert({
        brand_id: brandData.id,
        brand_code: body.brand,
        amount: body.amount,
        pin_encrypted: pinEncrypted,
        customer_name: body.name,
        customer_phone: body.phone,
        account_info: body.account,
        buy_rate: brandData.buy_rate,
        payment_amount: paymentAmount,
        message: body.message || null,
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'pending'
      })
      .select()
      .single()

    if (purchaseError) {
      console.error('Purchase insert error:', purchaseError)
      return new Response(
        JSON.stringify({ error: '매입 신청 처리 중 오류가 발생했습니다.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 거래 내역 생성
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        purchase_request_id: purchaseData.id,
        transaction_type: 'purchase',
        amount: paymentAmount,
        status: 'pending',
        description: `${body.brand} 상품권 매입 (${body.amount.toLocaleString()}원)`
      })

    if (transactionError) {
      console.error('Transaction insert error:', transactionError)
    }

    // 성공 응답
    return new Response(
      JSON.stringify({
        success: true,
        message: '매입 신청이 접수되었습니다.',
        data: {
          id: purchaseData.id,
          amount: body.amount,
          buyRate: brandData.buy_rate,
          paymentAmount: paymentAmount,
          estimatedTime: '3분 이내'
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        error: '서버 오류가 발생했습니다.',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
